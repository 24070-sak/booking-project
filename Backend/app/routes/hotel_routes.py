from flask import Blueprint, jsonify, request
from app.models.hotel import Hotel
from app.models.room import Room
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.helpers import update_db_dump

hotel_bp = Blueprint('hotels', __name__, url_prefix='/api/hotels')

@hotel_bp.route('', methods=['GET'])
def get_hotels():
    """Liste tous les hôtels disponibles (avec pagination et filtres)"""
    from sqlalchemy import or_, and_, not_
    from app.models.booking import Booking
    from datetime import datetime
    
    limit = request.args.get('limit', default=10, type=int)
    offset = request.args.get('offset', default=0, type=int)
    
    search_query = request.args.get('search', default='', type=str)
    guests = request.args.get('guests', default=0, type=int)
    
    check_in = request.args.get('check_in')
    check_out = request.args.get('check_out')
    
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    location = request.args.get('location', type=str)
    min_rating = request.args.get('min_rating', type=float)
    
    # Define constraints for a valid room
    room_constraints = [Room.is_available == True]
    
    if guests > 0:
        room_constraints.append(Room.max_guests >= guests)
        
    if min_price is not None:
        room_constraints.append(Room.price_per_night >= min_price)
    if max_price is not None:
        room_constraints.append(Room.price_per_night <= max_price)
        
    # Date Filtering Logic
    if check_in and check_out:
        try:
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
            
            # Subquery to find booked room IDs in the range
            booked_rooms_subquery = db.session.query(Booking.room_id).filter(
                and_(
                    Booking.room_id == Room.id,
                    Booking.status != 'cancelled',
                    Booking.check_in_date < check_out_date,
                    Booking.check_out_date > check_in_date
                )
            ).exists()
            
            # Constraint: Room must NOT be in the booked list for these dates
            room_constraints.append(not_(booked_rooms_subquery))
            
        except ValueError:
            pass # Invalid date format, ignore
            
    base_query = Hotel.query
    if location:
        base_query = base_query.filter(Hotel.location.ilike(f"%{location}%"))
    if min_rating is not None:
        base_query = base_query.filter(Hotel.rating >= min_rating)
    
    # Combined Query
    if search_query:
        search_term = f"%{search_query}%"
        
        query = base_query.filter(
            or_(
                and_(
                    (Hotel.name.ilike(search_term)) | (Hotel.location.ilike(search_term)),
                    Hotel.rooms.any(and_(*room_constraints))
                ),
                Hotel.rooms.any(and_(*room_constraints, Room.name.ilike(search_term)))
            )
        )
    else:
        query = base_query.filter(Hotel.rooms.any(and_(*room_constraints)))
    
    total_available = query.count()
    hotels = query.offset(offset).limit(limit).all()
    
    return jsonify({
        'hotels': [h.to_dict() for h in hotels],
        'total': total_available
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
    
    # Increment Analytics
    import random
    hotel.views += 1
    
    # Simulate unique visitors (approx 70% of views)
    if random.random() < 0.7:
        hotel.unique_visitors += 1
        
    # Simulate bounce rate updates (keep it between 20% and 60%)
    if hotel.bounce_rate == 0:
        hotel.bounce_rate = random.randint(20, 60)
    else:
        # Slight fluctuation
        change = random.randint(-2, 2)
        hotel.bounce_rate = max(10, min(90, hotel.bounce_rate + change))
        
    db.session.commit()
    
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
