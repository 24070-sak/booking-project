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
    
    # Relations
    rooms = db.relationship('Room', backref='hotel', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'description': self.description,
            'image_url': self.image_url,
            'rating': self.rating,
            'rooms_count': self.rooms.count()
        }
    
    def __repr__(self):
        return f'<Hotel {self.name}>'
