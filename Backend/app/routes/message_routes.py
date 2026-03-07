from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.message import Message
from app.models.user import User
from app.models.booking import Booking
from app.models.room import Room

message_bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@message_bp.route('', methods=['GET'])
@jwt_required()
def get_messages():
    """Récupère les messages de l'utilisateur ou tous les messages si admin"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
    if user.role in ['admin', 'manager']:
        # Admin voit tout
        messages = Message.query.order_by(Message.created_at.desc()).all()
    elif user.access_dashboard and user.hotels.count() > 0:
        # Owner voit les messages des clients qui ont réservé ses hôtels
        owned_hotel_ids = [h.id for h in user.hotels]
        
        # Get all users who booked the owner's hotels
        guest_ids = db.session.query(Booking.user_id.distinct())\
            .join(Room, Booking.room_id == Room.id)\
            .filter(Room.hotel_id.in_(owned_hotel_ids))\
            .all()
        guest_ids = [gid[0] for gid in guest_ids]
        
        # Owner sees messages from/to these guests and their own messages
        messages = Message.query.filter(
            db.or_(
                Message.sender_id.in_(guest_ids),
                Message.receiver_id.in_(guest_ids),
                Message.sender_id == user_id,
                Message.receiver_id == user_id
            )
        ).order_by(Message.created_at.desc()).all()
    else:
        # Client voit ses messages (envoyés ou reçus)
        messages = Message.query.filter(
            (Message.sender_id == user_id) | (Message.receiver_id == user_id)
        ).order_by(Message.created_at.desc()).all()
        
    return jsonify({
        'messages': [m.to_dict() for m in messages],
        'total': len(messages)
    }), 200

@message_bp.route('', methods=['POST'])
@jwt_required()
def add_message():
    """Envoyer un nouveau message"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('subject') or not data.get('content'):
        return jsonify({'error': 'Sujet et contenu requis'}), 400
        
    new_message = Message(
        sender_id=user_id,
        receiver_id=data.get('receiver_id'), # Peut être None pour l'admin
        subject=data['subject'],
        content=data['content']
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message envoyé avec succès',
        'message_data': new_message.to_dict()
    }), 201

@message_bp.route('/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(message_id):
    """Marquer un message comme lu"""
    message = Message.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message non trouvé'}), 404
        
    message.is_read = True
    db.session.commit()
    return jsonify({'message': 'Message marqué comme lu'}), 200


@message_bp.route('/search-users', methods=['GET'])
@jwt_required()
def search_users():
    """Rechercher des utilisateurs par nom ou email pour démarrer une conversation"""
    user_id = get_jwt_identity()
    query = request.args.get('q', '').strip()
    
    if len(query) < 2:
        return jsonify({'users': []}), 200
    
    search_pattern = f"%{query}%"
    
    users = User.query.filter(
        User.id != user_id,
        User.is_active == True,
        db.or_(
            User.first_name.ilike(search_pattern),
            User.last_name.ilike(search_pattern),
            User.email.ilike(search_pattern),
            User.username.ilike(search_pattern),
            db.func.concat(User.first_name, ' ', User.last_name).ilike(search_pattern)
        )
    ).limit(10).all()
    
    return jsonify({
        'users': [{
            'id': u.id,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'email': u.email,
            'profile_picture': u.profile_picture,
            'role': u.role
        } for u in users]
    }), 200
