import os
import uuid
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.booking import Booking
from app.models.payment import Payment
from app.extensions import db
from app.utils.helpers import update_db_dump
from app.utils.security import get_owned_hotel_ids, is_owner_of_booking
from datetime import datetime

payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

UPLOAD_FOLDER = 'app/static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@payment_bp.route('', methods=['GET'])
@jwt_required()
def get_payments():
    """Liste les paiements de l'utilisateur actuel"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    query = Payment.query.join(Booking)
    
    # SECURITY FIX: Differentiate between admin and manager
    if user.role == 'admin':
        pass # All payments
    elif user.role == 'manager' or user.access_dashboard:
        owned_hotel_ids = get_owned_hotel_ids(user)
        from app.models.room import Room
        query = query.join(Room).filter(Room.hotel_id.in_(owned_hotel_ids or []))
    else:
        # Client only sees own payments
        query = query.filter(Booking.user_id == user.id)
    
    payments = query.order_by(Payment.created_at.desc()).all()
    
    return jsonify({
        'payments': [p.to_dict() for p in payments],
        'total': len(payments)
    }), 200

@payment_bp.route('/submit-local', methods=['POST'])
@jwt_required()
def submit_local_payment():
    """Soumettre un paiement local (Bankily/Sedad/Masrivi)"""
    user_id = int(get_jwt_identity())
    
    if 'screenshot' not in request.files:
        return jsonify({'error': 'Capture d\'écran requise'}), 400
    
    file = request.files['screenshot']
    booking_id = request.form.get('booking_id')
    bank_app = request.form.get('bank_app')
    phone = request.form.get('transaction_phone')
    
    if not all([booking_id, bank_app, phone]):
        return jsonify({'error': 'Tous les champs sont requis'}), 400
        
    booking = Booking.query.get(booking_id)
    if not booking or booking.user_id != int(user_id):
        return jsonify({'error': 'Réservation non trouvée'}), 404
        
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
        upload_path = os.path.join(current_app.root_path, 'static/uploads', filename)
        file.save(upload_path)
        screenshot_url = f"/static/uploads/{filename}"
    else:
        return jsonify({'error': 'Format de fichier non supporté'}), 400
        
    # Create or update payment
    payment = Payment.query.filter_by(booking_id=booking_id).first()
    if not payment:
        payment = Payment(booking_id=booking_id)
        db.session.add(payment)
        
    payment.amount = booking.total_price
    payment.payment_method = 'local_app'
    payment.bank_app = bank_app
    payment.transaction_phone = phone
    payment.screenshot_url = screenshot_url
    payment.status = 'pending'
    
    # Update booking status
    booking.status = 'pending' # Ensure it stays pending until verified
    
    # Notify Manager
    from app.models.notification import Notification, NotificationSetting
    room = booking.room
    hotel = room.hotel if room else None
    
    if hotel:
        manager_settings = NotificationSetting.query.get(hotel.user_id)
        if not manager_settings or manager_settings.notify_payments:
            user_guest = User.query.get(user_id)
            guest_name = f"{user_guest.first_name} {user_guest.last_name}" if user_guest else "Un client"
            
            notif_manager = Notification(
                user_id=hotel.user_id,
                title='Nouveau paiement à vérifier',
                message=f'{guest_name} a soumis un justificatif de paiement local pour {room.name} via {bank_app}. Veuillez le vérifier.',
                type='payment',
                room_id=room.id,
                hotel_id=hotel.id,
                booking_id=booking.id
            )
            db.session.add(notif_manager)
    
    db.session.commit()
    update_db_dump()
    
    return jsonify({
        'message': 'Paiement soumis pour vérification',
        'payment': payment.to_dict()
    }), 201

@payment_bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending_payments():
    """Liste les paiements en attente (Admin seulement)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'manager'] and not user.access_dashboard:
        return jsonify({'error': 'Accès non autorisé'}), 403
        
    query = Payment.query.filter_by(status='pending')
    
    owned_hotel_ids = get_owned_hotel_ids(user)
    if owned_hotel_ids is not None:
        from app.models.room import Room
        query = query.join(Booking).join(Room).filter(Room.hotel_id.in_(owned_hotel_ids))
        
    payments = query.all()
    return jsonify({
        'payments': [p.to_dict() for p in payments],
        'total': len(payments)
    }), 200

@payment_bp.route('/<int:payment_id>/verify', methods=['POST'])
@jwt_required()
def verify_payment(payment_id):
    """Confirmer ou refuser un paiement (Admin seulement)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'manager'] and not user.access_dashboard:
        return jsonify({'error': 'Accès non autorisé'}), 403
        
    data = request.get_json()
    action = data.get('action') # 'approve' or 'refuse'
    
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Paiement non trouvé'}), 404
        
    booking = payment.booking
    
    # SECURITY FIX: Ensure ownership
    if not is_owner_of_booking(user, booking):
        return jsonify({'error': 'Accès non autorisé à ce paiement'}), 403
    
    from app.models.notification import Notification, NotificationSetting
    room = booking.room
    hotel = room.hotel if room else None
    hotel_name = hotel.name if hotel else 'l\'hôtel'

    if action == 'approve':
        payment.status = 'completed'
        payment.paid_at = datetime.utcnow()
        booking.status = 'confirmed'
        
        # Notify User of approval
        user_settings = NotificationSetting.query.get(booking.user_id)
        if not user_settings or user_settings.notify_payments:
            notif_user = Notification(
                user_id=booking.user_id,
                title='Paiement vérifié et approuvé',
                message=f'Votre paiement pour {room.name} à {hotel_name} a été validé. Votre réservation est maintenant confirmée.',
                type='payment',
                room_id=room.id,
                hotel_id=hotel.id if hotel else None
            )
            db.session.add(notif_user)
            
    elif action == 'refuse':
        payment.status = 'failed'
        booking.status = 'cancelled'
        # If cancelled, the room becomes available implicitly by status being 'cancelled'
        # Logic in booking_routes.py already checks for 'pending' or 'confirmed'
        
        # Notify User of refusal
        user_settings = NotificationSetting.query.get(booking.user_id)
        if not user_settings or user_settings.notify_payments:
            notif_user = Notification(
                user_id=booking.user_id,
                title='Paiement refusé',
                message=f'Votre justificatif de paiement pour {room.name} à {hotel_name} a été refusé par l\'établissement. La réservation est annulée.',
                type='payment',
                room_id=room.id,
                hotel_id=hotel.id if hotel else None
            )
            db.session.add(notif_user)
            
    else:
        return jsonify({'error': 'Action invalide'}), 400
        
    db.session.commit()
    update_db_dump()
    
    return jsonify({
        'message': f'Paiement {"approuvé" if action == "approve" else "refusé"}',
        'payment': payment.to_dict(),
        'booking': booking.to_dict()
    }), 200
