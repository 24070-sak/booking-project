from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.room import Room, RoomType, Amenity
from app.models.hotel import Hotel
from app.models.booking import Booking
from app.models.review import Review
from sqlalchemy import func
from app.utils.helpers import update_db_dump

room_bp = Blueprint('rooms', __name__, url_prefix='/api/rooms')

@room_bp.route('', methods=['POST'])
@jwt_required()
def create_room():
    """Créer une nouvelle chambre (Pour les owners)"""
    user_id = get_jwt_identity()
    from app.models.user import User
    user = User.query.get(user_id)
    
    if not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403
        
    data = request.get_json()
    
    # Validation
    required = ['room_number', 'name', 'room_type_id', 'price_per_night', 'hotel_id']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Le champ {field} est requis'}), 400
            
    # Vérifier si l'utilisateur possède l'hôtel
    hotel = Hotel.query.get(data['hotel_id'])
    if not hotel or str(hotel.user_id) != str(user_id):
        return jsonify({'error': 'Accès interdit. Vous n\'êtes pas le propriétaire de cet hôtel.'}), 403
            
    new_room = Room(
        room_number=data['room_number'],
        name=data['name'],
        description=data.get('description'),
        room_type_id=data['room_type_id'],
        hotel_id=data['hotel_id'],
        price_per_night=data['price_per_night'],
        max_guests=data.get('max_guests', 2),
        size_sqm=data.get('size_sqm'),
        image_url=data.get('image_url')
    )
    
    # Ajouter les équipements
    if data.get('amenities'):
        amenities = Amenity.query.filter(Amenity.id.in_(data['amenities'])).all()
        new_room.amenities = amenities
    
    db.session.add(new_room)
    db.session.commit()
    update_db_dump()
    
    return jsonify({'message': 'Chambre créée', 'room': new_room.to_dict()}), 201

@room_bp.route('/<int:room_id>', methods=['PUT'])
@jwt_required()
def update_room(room_id):
    """Mettre à jour une chambre (Seulement si propriétaire de l'hôtel)"""
    user_id = get_jwt_identity()
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
        
    if str(room.hotel.user_id) != str(user_id):
        return jsonify({'error': 'Accès interdit'}), 403
        
    data = request.get_json()
    
    if 'room_number' in data: room.room_number = data['room_number']
    if 'name' in data: room.name = data['name']
    if 'description' in data: room.description = data['description']
    if 'room_type_id' in data: room.room_type_id = data['room_type_id']
    if 'price_per_night' in data: room.price_per_night = data['price_per_night']
    if 'max_guests' in data: room.max_guests = data['max_guests']
    if 'size_sqm' in data: room.size_sqm = data['size_sqm']
    if 'is_available' in data: room.is_available = data['is_available']
    if 'image_url' in data: room.image_url = data['image_url']
    
    # Mettre à jour les équipements
    if 'amenities' in data:
        amenities = Amenity.query.filter(Amenity.id.in_(data['amenities'])).all()
        room.amenities = amenities
        
    db.session.commit()
    update_db_dump()
    
    return jsonify({'message': 'Chambre mise à jour', 'room': room.to_dict()}), 200

@room_bp.route('/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id):
    """Supprimer une chambre"""
    user_id = get_jwt_identity()
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
        
    if str(room.hotel.user_id) != str(user_id):
        return jsonify({'error': 'Accès interdit'}), 403
        
    db.session.delete(room)
    db.session.commit()
    update_db_dump()
    
    return jsonify({'message': 'Chambre supprimée'}), 200

@room_bp.route('', methods=['GET'])
def get_rooms():
    """Obtenir la liste des chambres publique"""
    rooms = Room.query.filter_by(is_available=True).all()
    return jsonify({
        'rooms': [room.to_dict() for room in rooms],
        'total': len(rooms)
    }), 200

@room_bp.route('/<int:room_id>', methods=['GET'])
def get_room(room_id):
    """Détails d'une chambre"""
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
    return jsonify({'room': room.to_dict()}), 200

@room_bp.route('/types', methods=['GET'])
def get_room_types():
    """Types de chambres"""
    room_types = RoomType.query.all()
    return jsonify({'room_types': [rt.to_dict() for rt in room_types]}), 200

@room_bp.route('/amenities', methods=['GET'])
def get_amenities():
    """Equipements"""
    amenities = Amenity.query.all()
    return jsonify({'amenities': [a.to_dict() for a in amenities]}), 200
