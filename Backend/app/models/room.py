from app.extensions import db
from datetime import datetime

# Table d'association pour les équipements des chambres
room_amenities = db.Table('room_amenities',
    db.Column('room_id', db.Integer, db.ForeignKey('rooms.id'), primary_key=True),
    db.Column('amenity_id', db.Integer, db.ForeignKey('amenities.id'), primary_key=True)
)


class RoomType(db.Model):
    """
    Table des types de chambres
    Ex: Suite, Standard, Deluxe
    """
    __tablename__ = 'room_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.Text)
    base_price = db.Column(db.Float, nullable=False)
    max_occupancy = db.Column(db.Integer, default=2)
    
    # Relations
    rooms = db.relationship('Room', backref='room_type', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'base_price': self.base_price,
            'max_occupancy': self.max_occupancy
        }
    
    def __repr__(self):
        return f'<RoomType {self.name}>'


class Amenity(db.Model):
    """
    Table des équipements/services
    Ex: WiFi, Climatisation, Mini-bar
    """
    __tablename__ = 'amenities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    icon = db.Column(db.String(50))  # Nom de l'icône FontAwesome par exemple
    description = db.Column(db.String(200))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'description': self.description
        }
    
    def __repr__(self):
        return f'<Amenity {self.name}>'


class Room(db.Model):
    """
    Table des chambres
    Représente chaque chambre disponible dans l'hôtel
    """
    __tablename__ = 'rooms'
    
    id = db.Column(db.Integer, primary_key=True)
    room_number = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    room_type_id = db.Column(db.Integer, db.ForeignKey('room_types.id'), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=True) # Nullable pour transition, mais devrait être Not Null
    price_per_night = db.Column(db.Float, nullable=False)
    floor = db.Column(db.Integer)
    size_sqm = db.Column(db.Float)  # Taille en mètres carrés
    bed_type = db.Column(db.String(50))  # 'single', 'double', 'king', 'twin'
    max_guests = db.Column(db.Integer, default=2)
    is_available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    amenities = db.relationship('Amenity', secondary=room_amenities, 
                                backref=db.backref('rooms', lazy='dynamic'))
    bookings = db.relationship('Booking', backref='room', lazy='dynamic')
    images = db.relationship('RoomImage', backref='room', lazy='dynamic', cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='room', lazy='dynamic')
    
    def to_dict(self, include_amenities=True):
        data = {
            'id': self.id,
            'room_number': self.room_number,
            'name': self.name,
            'description': self.description,
            'room_type': self.room_type.to_dict() if self.room_type else None,
            'hotel_id': self.hotel_id,
            'price_per_night': self.price_per_night,
            'floor': self.floor,
            'size_sqm': self.size_sqm,
            'bed_type': self.bed_type,
            'max_guests': self.max_guests,
            'is_available': self.is_available,
            'image_url': self.image_url,
            'images': [img.to_dict() for img in self.images] if self.images else []
        }
        if include_amenities:
            data['amenities'] = [a.to_dict() for a in self.amenities]
        return data
    
    def __repr__(self):
        return f'<Room {self.room_number} - {self.name}>'


class RoomImage(db.Model):
    """
    Table des images de chambres
    Permet d'avoir plusieurs images par chambre
    """
    __tablename__ = 'room_images'
    
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(200))
    is_primary = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'image_url': self.image_url,
            'caption': self.caption,
            'is_primary': self.is_primary,
            'display_order': self.display_order
        }
    
    def __repr__(self):
        return f'<RoomImage {self.id} for Room {self.room_id}>'
