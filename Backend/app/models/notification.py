from app.extensions import db
from datetime import datetime, timezone

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=True) # 'booking_created', 'booking_action', 'message', 'payment', 'system'
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete='SET NULL'), nullable=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id', ondelete='SET NULL'), nullable=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='SET NULL'), nullable=True)
    transaction_id = db.Column(db.String(100), nullable=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    user_related = db.relationship('User', foreign_keys=[user_id], backref=db.backref('notifications', lazy=True, cascade='all, delete-orphan'))
    sender_related = db.relationship('User', foreign_keys=[sender_id], backref='notifications_sent')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'sender_id': self.sender_id,
            'sender_name': f"{self.sender_related.first_name} {self.sender_related.last_name}" if self.sender_related else None,
            'sender_picture': self.sender_related.profile_picture if self.sender_related else None,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'room_id': self.room_id,
            'hotel_id': self.hotel_id,
            'booking_id': self.booking_id,
            'transaction_id': self.transaction_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class NotificationSetting(db.Model):
    __tablename__ = 'notification_settings'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    notify_messages = db.Column(db.Boolean, default=True)
    notify_bookings = db.Column(db.Boolean, default=True)
    notify_payments = db.Column(db.Boolean, default=True)
    sound_enabled = db.Column(db.Boolean, default=True)
    
    # Relationship handled by user_id FK, but can add explicit backref if needed
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'notify_messages': self.notify_messages,
            'notify_bookings': self.notify_bookings,
            'notify_payments': self.notify_payments,
            'sound_enabled': self.sound_enabled
        }
