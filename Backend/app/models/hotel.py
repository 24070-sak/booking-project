from app.extensions import db
from datetime import datetime

class Hotel(db.Model):
    """
    Table des hôtels
    """
    __tablename__ = 'hotels'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    rating = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # owner of the hotel
    
    # Analytics
    views = db.Column(db.Integer, default=0)
    unique_visitors = db.Column(db.Integer, default=0)
    bounce_rate = db.Column(db.Integer, default=0) # Stored as percentage int
    
    # Relations
    rooms = db.relationship('Room', backref='hotel', lazy='dynamic')
    
    def to_dict(self):
        from app.models.room import Room
        
        # Calculate availability and lowest price
        available_rooms_query = self.rooms.filter_by(is_available=True)
        has_availability = available_rooms_query.first() is not None
        
        lowest_price = None
        if has_availability:
            cheapest_room = available_rooms_query.order_by(Room.price_per_night.asc()).first()
            if cheapest_room:
                lowest_price = cheapest_room.price_per_night

        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'description': self.description,
            'image_url': self.image_url,
            'rating': self.rating,
            'rooms_count': self.rooms.count(),
            'owner_id': self.user_id,
            'owner_name': f"{self.owner.first_name} {self.owner.last_name}" if self.owner else None,
            'owner_picture': self.owner.profile_picture if self.owner else None,
            'has_availability': has_availability,
            'lowest_price': lowest_price
        }
    
    def __repr__(self):
        return f'<Hotel {self.name}>'
