from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.room import Room, RoomType, Amenity
from app.models.booking import Booking
from app.models.review import Review
from sqlalchemy import func
from app.utils.helpers import admin_required, update_db_dump

room_bp = Blueprint('rooms', __name__, url_prefix='/api/rooms')

@room_bp.route('', methods=['POST'])
@jwt_required()
@admin_required()
def create_room():
    """Créer une nouvelle chambre (Admin seulement)"""
    data = request.get_json()
    
    # Validation basique
    required = ['room_number', 'name', 'room_type_id', 'price_per_night']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Le champ {field} est requis'}), 400
            
    # Vérifier l'existence du numéro de chambre
    if Room.query.filter_by(room_number=data['room_number']).first():
        return jsonify({'error': 'Ce numéro de chambre existe déjà'}), 400
        
    new_room = Room(
        room_number=data['room_number'],
        name=data['name'],
        description=data.get('description'),
        room_type_id=data['room_type_id'],
        hotel_id=data.get('hotel_id'),
        price_per_night=data['price_per_night'],
        floor=data.get('floor'),
        size_sqm=data.get('size_sqm'),
        bed_type=data.get('bed_type', 'double'),
        max_guests=data.get('max_guests', 2),
        image_url=data.get('image_url')
    )
    
    db.session.add(new_room)
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
    return jsonify({'message': 'Chambre créée avec succès', 'room': new_room.to_dict()}), 201

@room_bp.route('/<int:room_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_room(room_id):
    """Mettre à jour une chambre"""
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
        
    data = request.get_json()
    
    if 'room_number' in data:
        # Vérifier si le nouveau numéro est déjà pris par une autre chambre
        existing = Room.query.filter_by(room_number=data['room_number']).first()
        if existing and existing.id != room_id:
            return jsonify({'error': 'Ce numéro de chambre est déjà utilisé'}), 400
        room.room_number = data['room_number']
        
    if 'name' in data: room.name = data['name']
    if 'description' in data: room.description = data['description']
    if 'room_type_id' in data: room.room_type_id = data['room_type_id']
    if 'hotel_id' in data: room.hotel_id = data['hotel_id']
    if 'price_per_night' in data: room.price_per_night = data['price_per_night']
    if 'floor' in data: room.floor = data['floor']
    if 'size_sqm' in data: room.size_sqm = data['size_sqm']
    if 'bed_type' in data: room.bed_type = data['bed_type']
    if 'max_guests' in data: room.max_guests = data['max_guests']
    if 'is_available' in data: room.is_available = data['is_available']
    if 'image_url' in data: room.image_url = data['image_url']
        
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
    return jsonify({'message': 'Chambre mise à jour', 'room': room.to_dict()}), 200

@room_bp.route('/<int:room_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_room(room_id):
    """Supprimer une chambre"""
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
        
    db.session.delete(room)
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
    return jsonify({'message': 'Chambre supprimée'}), 200


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
