from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.notification import Notification, NotificationSetting

notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notification_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Fetch recent notifications and unread count for the current user."""
    user_id = get_jwt_identity()
    limit = request.args.get('limit', 50, type=int)
    
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(limit).all()
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200

@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    """Mark a specific notification as read."""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    
    if not notification:
        return jsonify({'error': 'Notification non trouvée'}), 404
        
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Marquée comme lue', 'notification': notification.to_dict()}), 200

@notification_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read for the current user."""
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    
    return jsonify({'message': 'Toutes les notifications ont été marquées comme lues'}), 200

@notification_bp.route('/read-by-type', methods=['PUT'])
@jwt_required()
def mark_by_type_as_read():
    """Mark all notifications of a specific type as read for the current user."""
    user_id = get_jwt_identity()
    data = request.get_json()
    notif_type = data.get('type')
    
    if not notif_type:
        return jsonify({'error': 'Type de notification requis'}), 400
        
    Notification.query.filter_by(user_id=user_id, type=notif_type, is_read=False).update({'is_read': True})
    db.session.commit()
    
    return jsonify({'message': f'Notifications de type {notif_type} marquées comme lues'}), 200

@notification_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Fetch notification settings for the user."""
    user_id = get_jwt_identity()
    settings = NotificationSetting.query.get(user_id)
    
    if not settings:
        settings = NotificationSetting(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
        
    return jsonify({'settings': settings.to_dict()}), 200

@notification_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update notification settings."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    settings = NotificationSetting.query.get(user_id)
    if not settings:
        settings = NotificationSetting(user_id=user_id)
        db.session.add(settings)
        
    if 'notify_messages' in data:
        settings.notify_messages = data['notify_messages']
    if 'notify_bookings' in data:
        settings.notify_bookings = data['notify_bookings']
    if 'notify_payments' in data:
        settings.notify_payments = data['notify_payments']
    if 'sound_enabled' in data:
        settings.sound_enabled = data['sound_enabled']
        
    db.session.commit()
    
    return jsonify({'message': 'Paramètres mis à jour', 'settings': settings.to_dict()}), 200
