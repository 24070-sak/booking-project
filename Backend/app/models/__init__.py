# Export de tous les modèles
from app.models.user import User
from app.models.room import Room, RoomType, Amenity, RoomImage, room_amenities
from app.models.booking import Booking, Payment, Review

__all__ = [
    'User',
    'Room',
    'RoomType',
    'Amenity',
    'RoomImage',
    'room_amenities',
    'Booking',
    'Payment',
    'Review'
]
