from flask import Blueprint, jsonify
from app.models.hotel import Hotel
from app.models.room import Room

hotel_bp = Blueprint('hotels', __name__, url_prefix='/api/hotels')

@hotel_bp.route('', methods=['GET'])
def get_hotels():
    """Liste tous les hôtels"""
    hotels = Hotel.query.all()
    return jsonify({
        'hotels': [h.to_dict() for h in hotels],
        'total': len(hotels)
    }), 200

@hotel_bp.route('/<int:hotel_id>', methods=['GET'])
def get_hotel_details(hotel_id):
    """Détails d'un hôtel"""
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'error': 'Hôtel non trouvé'}), 404
    
    return jsonify({'hotel': hotel.to_dict()}), 200

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
