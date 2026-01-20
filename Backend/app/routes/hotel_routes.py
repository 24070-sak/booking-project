from flask import Blueprint, jsonify, request
from app.models.hotel import Hotel
from app.models.room import Room
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.helpers import update_db_dump

hotel_bp = Blueprint('hotels', __name__, url_prefix='/api/hotels')

@hotel_bp.route('', methods=['GET'])
def get_hotels():
    """Liste tous les hôtels (Pour la page d'accueil)"""
    hotels = Hotel.query.all()
    return jsonify({
        'hotels': [h.to_dict() for h in hotels],
        'total': len(hotels)
    }), 200

@hotel_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_hotels():
    """Liste les hôtels possédés par l'utilisateur connecté"""
    user_id = get_jwt_identity()
    hotels = Hotel.query.filter_by(user_id=user_id).all()
    return jsonify({
        'hotels': [h.to_dict() for h in hotels],
        'total': len(hotels)
    }), 200

@hotel_bp.route('', methods=['POST'])
@jwt_required()
def create_hotel():
    """Créer un nouvel hôtel (Nécessite access_dashboard)"""
    user_id = get_jwt_identity()
    from app.models.user import User
    user = User.query.get(user_id)
    
    if not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403
        
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Le nom est requis'}), 400
        
    new_hotel = Hotel(
        name=data.get('name'),
        location=data.get('location'),
        description=data.get('description'),
        image_url=data.get('image_url'),
        rating=data.get('rating', 0.0),
        user_id=user_id # Assign owner
    )
    
    db.session.add(new_hotel)
    db.session.commit()
    
    update_db_dump()
    
    return jsonify({'message': 'Hôtel créé avec succès', 'hotel': new_hotel.to_dict()}), 201

@hotel_bp.route('/<int:hotel_id>', methods=['GET'])
def get_hotel_details(hotel_id):
    """Détails d'un hôtel"""
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'error': 'Hôtel non trouvé'}), 404
    
    return jsonify({'hotel': hotel.to_dict()}), 200

@hotel_bp.route('/<int:hotel_id>', methods=['PUT'])
@jwt_required()
def update_hotel(hotel_id):
    """Mettre à jour un hôtel (Seulement si propriétaire)"""
    user_id = get_jwt_identity()
    hotel = Hotel.query.get(hotel_id)
    
    if not hotel:
        return jsonify({'error': 'Hôtel non trouvé'}), 404
        
    if str(hotel.user_id) != str(user_id):
        return jsonify({'error': 'Accès interdit. Vous n\'êtes pas le propriétaire.'}), 403
        
    data = request.get_json()
    
    if 'name' in data:
        hotel.name = data['name']
    if 'location' in data:
        hotel.location = data['location']
    if 'description' in data:
        hotel.description = data['description']
    if 'image_url' in data:
        hotel.image_url = data['image_url']
    if 'rating' in data:
        hotel.rating = data['rating']
        
    db.session.commit()
    update_db_dump()
    
    return jsonify({'message': 'Hôtel mis à jour', 'hotel': hotel.to_dict()}), 200

@hotel_bp.route('/<int:hotel_id>', methods=['DELETE'])
@jwt_required()
def delete_hotel(hotel_id):
    """Supprimer un hôtel (Seulement si propriétaire)"""
    user_id = get_jwt_identity()
    hotel = Hotel.query.get(hotel_id)
    
    if not hotel:
        return jsonify({'error': 'Hôtel non trouvé'}), 404
        
    if str(hotel.user_id) != str(user_id):
        return jsonify({'error': 'Accès interdit. Vous n\'êtes pas le propriétaire.'}), 403
        
    db.session.delete(hotel)
    db.session.commit()
    update_db_dump()
    
    return jsonify({'message': 'Hôtel supprimé'}), 200

@hotel_bp.route('/<int:hotel_id>/rooms', methods=['GET'])
def get_hotel_rooms(hotel_id):
    """Liste les chambres d'un hôtel"""
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'error': 'Hôtel non trouvé'}), 404
    
    rooms = Room.query.filter_by(hotel_id=hotel_id).all()
    
    return jsonify({
        'rooms': [r.to_dict() for r in rooms],
        'total': len(rooms)
    }), 200
