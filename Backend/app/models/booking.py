from app.extensions import db
from datetime import datetime
import uuid

class Booking(db.Model):
    """
    Table des réservations
    Gère toutes les réservations de chambres
    """
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(db.String(20), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    check_in_date = db.Column(db.Date, nullable=False)
    check_out_date = db.Column(db.Date, nullable=False)
    num_guests = db.Column(db.Integer, default=1)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'confirmed', 'cancelled', 'completed'
    special_requests = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    payment = db.relationship('Payment', backref='booking', uselist=False, cascade='all, delete-orphan')
    
    @staticmethod
    def generate_booking_reference():
        """Génère une référence de réservation unique"""
        return f"BK{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:6].upper()}"
    
    def calculate_nights(self):
        """Calcule le nombre de nuits"""
        return (self.check_out_date - self.check_in_date).days
    
    def to_dict(self, include_room=True, include_user=True):
        data = {
            'id': self.id,
            'booking_reference': self.booking_reference,
            'check_in_date': self.check_in_date.isoformat() if self.check_in_date else None,
            'check_out_date': self.check_out_date.isoformat() if self.check_out_date else None,
            'num_guests': self.num_guests,
            'num_nights': self.calculate_nights(),
            'total_price': self.total_price,
            'status': self.status,
            'special_requests': self.special_requests,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'payment': self.payment.to_dict() if self.payment else None
        }
        if include_room and self.room:
            data['room'] = self.room.to_dict(include_amenities=False)
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'email': self.user.email,
                'profile_picture': self.user.profile_picture
            }
        return data
    
    def __repr__(self):
        return f'<Booking {self.booking_reference}>'
