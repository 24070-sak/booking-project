from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.room import Room
from app.models.user import User
from datetime import datetime

booking_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')


@booking_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    """Créer une nouvelle réservation"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validation
    required_fields = ['room_id', 'check_in_date', 'check_out_date', 'num_guests']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400
    
    # Vérifier la chambre
    room = Room.query.get(data['room_id'])
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
    
    if not room.is_available:
        return jsonify({'error': 'Chambre non disponible'}), 400
    
    # Parser les dates
    try:
        check_in = datetime.strptime(data['check_in_date'], '%Y-%m-%d').date()
        check_out = datetime.strptime(data['check_out_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Format de date invalide (YYYY-MM-DD)'}), 400
    
    if check_in >= check_out:
        return jsonify({'error': 'La date de départ doit être après la date d\'arrivée'}), 400
    
    if check_in < datetime.now().date():
        return jsonify({'error': 'La date d\'arrivée ne peut pas être dans le passé'}), 400
    
    # Vérifier la disponibilité
    conflicting = Booking.query.filter(
        Booking.room_id == room.id,
        Booking.status.in_(['pending', 'confirmed']),
        Booking.check_in_date < check_out,
        Booking.check_out_date > check_in
    ).first()
    
    if conflicting:
        return jsonify({'error': 'Chambre non disponible pour ces dates'}), 400
    
    # Calculer le prix
    num_nights = (check_out - check_in).days
    total_price = num_nights * room.price_per_night
    
    # Créer la réservation
    booking = Booking(
        booking_reference=Booking.generate_booking_reference(),
        user_id=user_id,
        room_id=room.id,
        check_in_date=check_in,
        check_out_date=check_out,
        num_guests=data['num_guests'],
        total_price=total_price,
        special_requests=data.get('special_requests')
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify({
        'message': 'Réservation créée',
        'booking': booking.to_dict()
    }), 201


@booking_bp.route('', methods=['GET'])
@jwt_required()
def get_user_bookings():
    """Obtenir les réservations de l'utilisateur connecté"""
    user_id = get_jwt_identity()
    status = request.args.get('status')
    
    query = Booking.query.filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    return jsonify({
        'bookings': [b.to_dict() for b in bookings],
        'total': len(bookings)
    }), 200


@booking_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Obtenir les détails d'une réservation"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({'error': 'Réservation non trouvée'}), 404
    
    # Vérifier les droits d'accès
    if booking.user_id != user_id and user.role not in ['admin', 'manager']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    return jsonify({'booking': booking.to_dict()}), 200


@booking_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_booking(booking_id):
    """Annuler une réservation"""
    user_id = get_jwt_identity()
    
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({'error': 'Réservation non trouvée'}), 404
    
    if booking.user_id != user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    if booking.status == 'completed':
        return jsonify({'error': 'Impossible d\'annuler une réservation terminée'}), 400
    
    if booking.status == 'cancelled':
        return jsonify({'error': 'Réservation déjà annulée'}), 400
    
    booking.status = 'cancelled'
    
    # Rembourser si paiement effectué
    if booking.payment and booking.payment.status == 'completed':
        booking.payment.status = 'refunded'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Réservation annulée',
        'booking': booking.to_dict()
    }), 200


@booking_bp.route('/<int:booking_id>/confirm', methods=['POST'])
@jwt_required()
def confirm_booking(booking_id):
    """Confirmer une réservation (admin/manager)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'manager']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({'error': 'Réservation non trouvée'}), 404
    
    if booking.status != 'pending':
        return jsonify({'error': 'Seules les réservations en attente peuvent être confirmées'}), 400
    
    booking.status = 'confirmed'
    db.session.commit()
    
    return jsonify({
        'message': 'Réservation confirmée',
        'booking': booking.to_dict()
    }), 200


@booking_bp.route('/<int:booking_id>/payment', methods=['POST'])
@jwt_required()
def process_payment(booking_id):
    """Traiter le paiement d'une réservation"""
    user_id = get_jwt_identity()
    
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({'error': 'Réservation non trouvée'}), 404
    
    if booking.user_id != user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    if booking.payment and booking.payment.status == 'completed':
        return jsonify({'error': 'Paiement déjà effectué'}), 400
    
    data = request.get_json()
    payment_method = data.get('payment_method', 'credit_card')
    
    # Créer ou mettre à jour le paiement
    import uuid
    
    if booking.payment:
        payment = booking.payment
    else:
        payment = Payment(booking_id=booking.id)
    
    payment.amount = booking.total_price
    payment.payment_method = payment_method
    payment.transaction_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"
    payment.status = 'completed'
    payment.paid_at = datetime.utcnow()
    
    if not booking.payment:
        db.session.add(payment)
    
    # Confirmer la réservation
    booking.status = 'confirmed'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Paiement effectué',
        'payment': payment.to_dict(),
        'booking': booking.to_dict()
    }), 200


# Routes admin
@booking_bp.route('/admin/all', methods=['GET'])
@jwt_required()
def get_all_bookings():
    """Obtenir toutes les réservations (admin/manager)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'manager']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    status = request.args.get('status')
    query = Booking.query
    
    if status:
        query = query.filter_by(status=status)
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    return jsonify({
        'bookings': [b.to_dict() for b in bookings],
        'total': len(bookings)
    }), 200
