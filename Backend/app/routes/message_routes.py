from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.message import Message
from app.models.user import User
from app.models.booking import Booking
from app.models.room import Room
from app.utils.security import get_owned_hotel_ids
from sqlalchemy import or_

message_bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@message_bp.route('', methods=['GET'])
@jwt_required()
def get_messages():
    """Récupère les messages de l'utilisateur ou tous les messages si admin"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
    if user.role == 'admin':
        # Admin voit tout
        messages = Message.query.order_by(Message.created_at.desc()).all()
    else:
        owned_hotel_ids = get_owned_hotel_ids(user)
        
        if owned_hotel_ids:
            # Owner voit les messages des clients qui ont réservé ses hôtels
            # AND messages they sent/received directly
            
            # Get all users who booked the owner's hotels
            guest_ids_query = db.session.query(Booking.user_id.distinct())\
                .join(Room, Booking.room_id == Room.id)\
                .filter(Room.hotel_id.in_(owned_hotel_ids))
            
            guest_ids = [gid[0] for gid in guest_ids_query.all()]
            
            messages = Message.query.filter(
                or_(
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
    
    if not data.get('content'):
        return jsonify({'error': 'Le contenu est requis'}), 400
        
    receiver_id = data.get('receiver_id')
    receiver_email = data.get('receiver_email')
    
    if not receiver_id and receiver_email:
        receiver_user = User.query.filter_by(email=receiver_email).first()
        if receiver_user:
            receiver_id = receiver_user.id
        else:
            return jsonify({'error': f'Aucuns utilisateur trouvé avec l\'email {receiver_email}'}), 404

    new_message = Message(
        sender_id=user_id,
        receiver_id=receiver_id, # Peut être None pour l'admin
        subject=data.get('subject', 'Message'),
        content=data['content']
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    # Notify Receiver(s)
    from app.models.notification import Notification, NotificationSetting
    
    receivers_to_notify = []
    if receiver_id:
        receivers_to_notify.append(receiver_id)
    else:
        # If no receiver_id, it's for admins
        # SECURITY FIX: Only notify real admins, managers shouldn't see blind admin messages
        # unless they are explicitly involved. For now, notifying only users with 'admin' role.
        admins = User.query.filter(User.role == 'admin').all()
        receivers_to_notify = [a.id for a in admins]

    sender = User.query.get(user_id)
    sender_name = f"{sender.first_name} {sender.last_name}" if sender else "Un utilisateur"

    for r_id in receivers_to_notify:
        # Check if receiver has message notifications enabled
        settings = NotificationSetting.query.get(r_id)
        wants_notification = settings.notify_messages if settings else True
        
        if wants_notification:
            notification = Notification(
                user_id=r_id,
                title="Nouveau message",
                message=f"Vous avez reçu un nouveau message de {sender_name}.",
                type="message",
                sender_id=user_id
            )
            db.session.add(notification)
    
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
