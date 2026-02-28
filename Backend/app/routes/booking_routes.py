from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.room import Room
from app.models.user import User
from app.utils.helpers import update_db_dump
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
    
    from datetime import timedelta
    # Allow timezone differences (up to 24h)
    yesterday = datetime.now().date() - timedelta(days=1)
    if check_in < yesterday:
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
    
    # Rendre la chambre indisponible après réservation
    room.is_available = False
    
    db.session.add(booking)
    
    from app.models.notification import Notification
    hotel = room.hotel
    notif = Notification(
        user_id=user_id,
        title='Réservation en attente',
        message=f'Vous avez réservé la chambre {room.name} à {hotel.name} pour le {check_in.strftime("%d/%m/%Y")}. La réservation est en attente.',
        type='booking_created',
        room_id=room.id,
        hotel_id=hotel.id
    )
    db.session.add(notif)
    
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
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
    if booking.user_id != int(user_id) and user.role not in ['admin', 'manager']:
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
    
    if booking.user_id != int(user_id):
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    if booking.status == 'completed':
        return jsonify({'error': 'Impossible d\'annuler une réservation terminée'}), 400
    
    if booking.status == 'cancelled':
        return jsonify({'error': 'Réservation déjà annulée'}), 400
    
    booking.status = 'cancelled'
    
    # Rembourser si paiement effectué
    if booking.payment and booking.payment.status == 'completed':
        booking.payment.status = 'refunded'
    
    # Rendre la chambre de nouveau disponible
    room = Room.query.get(booking.room_id)
    if room:
        room.is_available = True
        
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
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
    
    from app.models.notification import Notification
    room = booking.room
    hotel = room.hotel
    notif = Notification(
        user_id=booking.user_id,
        title='Réservation acceptée',
        message=f'Votre réservation pour {room.name} à {hotel.name} a été acceptée par l\'établissement.',
        type='booking_accepted',
        room_id=room.id,
        hotel_id=hotel.id
    )
    db.session.add(notif)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Réservation confirmée',
        'booking': booking.to_dict()
    }), 200


@booking_bp.route('/<int:booking_id>/reject', methods=['POST'])
@jwt_required()
def reject_booking(booking_id):
    """Refuser une réservation (admin/manager/owner)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'manager'] and not user.access_dashboard:
        return jsonify({'error': 'Accès non autorisé'}), 403
        
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Réservation non trouvée'}), 404
        
    if booking.status != 'pending':
        return jsonify({'error': 'Seules les réservations en attente peuvent être refusées'}), 400
        
    booking.status = 'cancelled'
    
    room = Room.query.get(booking.room_id)
    if room:
        room.is_available = True
        
    from app.models.notification import Notification
    hotel = room.hotel if room else None
    hotel_name = hotel.name if hotel else 'l\'hôtel'
    hotel_id = hotel.id if hotel else None
    room_name = room.name if room else 'la chambre'
    
    notif = Notification(
        user_id=booking.user_id,
        title='Réservation refusée',
        message=f'Désolé, votre réservation pour {room_name} à {hotel_name} a été refusée.',
        type='booking_rejected',
        room_id=booking.room_id,
        hotel_id=hotel_id
    )
    db.session.add(notif)
    db.session.commit()
    
    update_db_dump()
    
    return jsonify({'message': 'Réservation refusée', 'booking': booking.to_dict()}), 200


@booking_bp.route('/<int:booking_id>/payment', methods=['POST'])
@jwt_required()
def process_payment(booking_id):
    """Traiter le paiement d'une réservation"""
    user_id = get_jwt_identity()
    
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({'error': 'Réservation non trouvée'}), 404
    
    if booking.user_id != int(user_id):
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
    
    from app.models.notification import Notification
    room = booking.room
    hotel = room.hotel
    notif = Notification(
        user_id=booking.user_id,
        title='Paiement & Réservation confirmée',
        message=f'Votre paiement a été reçu. Votre réservation pour {room.name} à {hotel.name} est confirmée automatiquement.',
        type='booking_accepted',
        room_id=room.id,
        hotel_id=hotel.id
    )
    db.session.add(notif)
    
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
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
@booking_bp.route('/owner/all', methods=['GET'])
@jwt_required()
def get_owner_bookings():
    """Obtenir les réservations pour les hôtels de l'owner connecté"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403
        
    # Liste des IDs des hôtels possédés par l'utilisateur
    owned_hotel_ids = [h.id for h in user.hotels]
    
    status = request.args.get('status')
    query = Booking.query.join(Room).filter(Room.hotel_id.in_(owned_hotel_ids))
    
    if status:
        query = query.filter(Booking.status == status)
        
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    return jsonify({
        'bookings': [b.to_dict() for b in bookings],
        'total': len(bookings)
    }), 200
