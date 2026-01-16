from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.room import Room, RoomType, Amenity
from app.models.booking import Review
from sqlalchemy import func

room_bp = Blueprint('rooms', __name__, url_prefix='/api/rooms')


@room_bp.route('', methods=['GET'])
def get_rooms():
    """Obtenir la liste des chambres avec filtres"""
    # Paramètres de filtrage
    room_type = request.args.get('type')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    max_guests = request.args.get('guests', type=int)
    available_only = request.args.get('available', 'true').lower() == 'true'
    
    # Construction de la requête
    query = Room.query
    
    if available_only:
        query = query.filter(Room.is_available == True)
    
    if room_type:
        query = query.join(RoomType).filter(RoomType.name == room_type)
    
    if min_price:
        query = query.filter(Room.price_per_night >= min_price)
    
    if max_price:
        query = query.filter(Room.price_per_night <= max_price)
    
    if max_guests:
        query = query.filter(Room.max_guests >= max_guests)
    
    rooms = query.all()
    
    return jsonify({
        'rooms': [room.to_dict() for room in rooms],
        'total': len(rooms)
    }), 200


@room_bp.route('/<int:room_id>', methods=['GET'])
def get_room(room_id):
    """Obtenir les détails d'une chambre"""
    room = Room.query.get(room_id)
    
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
    
    # Calculer la note moyenne
    avg_rating = db.session.query(func.avg(Review.rating)).filter(
        Review.room_id == room_id
    ).scalar()
    
    room_data = room.to_dict()
    room_data['avg_rating'] = round(float(avg_rating), 1) if avg_rating else 0
    room_data['reviews_count'] = Review.query.filter_by(room_id=room_id).count()
    
    return jsonify({'room': room_data}), 200


@room_bp.route('/types', methods=['GET'])
def get_room_types():
    """Obtenir tous les types de chambres"""
    room_types = RoomType.query.all()
    
    return jsonify({
        'room_types': [rt.to_dict() for rt in room_types]
    }), 200


@room_bp.route('/amenities', methods=['GET'])
def get_amenities():
    """Obtenir tous les équipements"""
    amenities = Amenity.query.all()
    
    return jsonify({
        'amenities': [a.to_dict() for a in amenities]
    }), 200


@room_bp.route('/<int:room_id>/reviews', methods=['GET'])
def get_room_reviews(room_id):
    """Obtenir les avis d'une chambre"""
    room = Room.query.get(room_id)
    
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
    
    reviews = Review.query.filter_by(room_id=room_id).order_by(Review.created_at.desc()).all()
    
    return jsonify({
        'reviews': [r.to_dict() for r in reviews],
        'total': len(reviews)
    }), 200


@room_bp.route('/<int:room_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(room_id):
    """Ajouter un avis sur une chambre"""
    user_id = get_jwt_identity()
    
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
    
    data = request.get_json()
    
    if not data.get('rating') or not (1 <= data['rating'] <= 5):
        return jsonify({'error': 'Note entre 1 et 5 requise'}), 400
    
    review = Review(
        user_id=user_id,
        room_id=room_id,
        rating=data['rating'],
        comment=data.get('comment', '')
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify({
        'message': 'Avis ajouté',
        'review': review.to_dict()
    }), 201


@room_bp.route('/search', methods=['GET'])
def search_rooms():
    """Rechercher des chambres disponibles pour des dates"""
    check_in = request.args.get('check_in')
    check_out = request.args.get('check_out')
    guests = request.args.get('guests', 1, type=int)
    
    if not check_in or not check_out:
        return jsonify({'error': 'Dates de check-in et check-out requises'}), 400
    
    # Récupérer les chambres disponibles
    from app.models.booking import Booking
    from datetime import datetime
    
    check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
    check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
    
    # Chambres avec réservations conflictuelles
    booked_rooms = db.session.query(Booking.room_id).filter(
        Booking.status.in_(['pending', 'confirmed']),
        Booking.check_in_date < check_out_date,
        Booking.check_out_date > check_in_date
    ).subquery()
    
    # Chambres disponibles
    available_rooms = Room.query.filter(
        Room.is_available == True,
        Room.max_guests >= guests,
        ~Room.id.in_(booked_rooms)
    ).all()
    
    return jsonify({
        'rooms': [room.to_dict() for room in available_rooms],
        'total': len(available_rooms),
        'search_params': {
            'check_in': check_in,
            'check_out': check_out,
            'guests': guests
        }
    }), 200
