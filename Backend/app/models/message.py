from app.extensions import db
from datetime import datetime

class Message(db.Model):
    """
    Table des messages
    Gère la communication entre les utilisateurs et le système/admin
    """
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Null for system/admin
    subject = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': f"{self.sender.first_name} {self.sender.last_name}" if self.sender else "Inconnu",
            'sender_email': self.sender.email if self.sender else None,
            'sender_picture': self.sender.profile_picture if self.sender else None,
            'receiver_id': self.receiver_id,
            'receiver_name': f"{self.receiver.first_name} {self.receiver.last_name}" if self.receiver else "Système",
            'receiver_email': self.receiver.email if self.receiver else None,
            'receiver_picture': self.receiver.profile_picture if self.receiver else None,
            'sender_role': self.sender.role if self.sender else None,
            'receiver_role': self.receiver.role if self.receiver else None,
            'subject': self.subject,
            'content': self.content,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
