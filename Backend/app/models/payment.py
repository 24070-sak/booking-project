from app.extensions import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False, unique=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='MRU')
    payment_method = db.Column(db.String(50), default='credit_card')
    transaction_id = db.Column(db.String(100), unique=True)
    transaction_phone = db.Column(db.String(20))
    screenshot_url = db.Column(db.String(500))
    bank_app = db.Column(db.String(50)) # bankily, sedad, masrivi, etc.
    status = db.Column(db.String(20), default='pending') # pending, completed, failed, refunded
    paid_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'amount': self.amount,
            'currency': self.currency,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'transaction_phone': self.transaction_phone,
            'screenshot_url': self.screenshot_url,
            'bank_app': self.bank_app,
            'status': self.status,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'booking_reference': self.booking.booking_reference if self.booking else None,
            'guest_name': f"{self.booking.user.first_name} {self.booking.user.last_name}" if self.booking and self.booking.user else "Inconnu",
            'hotel_name': self.booking.room.hotel.name if self.booking and self.booking.room and self.booking.room.hotel else "Hôtel inconnu"
        }
