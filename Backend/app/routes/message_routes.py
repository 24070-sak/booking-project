from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.message import Message
from app.models.user import User

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
