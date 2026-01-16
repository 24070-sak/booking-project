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
                'email': self.user.email
            }
        return data
    
    def __repr__(self):
        return f'<Booking {self.booking_reference}>'


class Payment(db.Model):
    """
    Table des paiements
    Gère les informations de paiement pour chaque réservation
    """
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='EUR')
    payment_method = db.Column(db.String(50))  # 'credit_card', 'paypal', 'bank_transfer'
    transaction_id = db.Column(db.String(100), unique=True)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'completed', 'failed', 'refunded'
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'currency': self.currency,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }
    
    def __repr__(self):
        return f'<Payment {self.transaction_id}>'


class Review(db.Model):
    """
    Table des avis clients
    Permet aux clients de laisser des avis sur les chambres
    """
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 étoiles
    comment = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)  # Si l'utilisateur a vraiment séjourné
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'comment': self.comment,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'first_name': self.user.first_name,
                'last_name': self.user.last_name[0] + '.' if self.user.last_name else ''
            } if self.user else None
        }
    
    def __repr__(self):
        return f'<Review {self.id} - Rating: {self.rating}>'
