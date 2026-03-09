from app.models.hotel import Hotel

def get_owned_hotel_ids(user):
    """
    Returns a list of hotel IDs owned by the user.
    If the user is an admin, returns None (indicating global access).
    """
    if user.role == 'admin':
        return None
    
    return [h.id for h in user.hotels]

def is_owner_of_hotel(user, hotel_id):
    """
    Checks if the user owns a specific hotel.
    Admins are always considered owners.
    """
    if user.role == 'admin':
        return True
    
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return False
    
    return hotel.user_id == user.id

def is_owner_of_booking(user, booking):
    """
    Checks if the user owns the hotel associated with a booking.
    Admins are always considered owners.
    """
    if user.role == 'admin':
        return True
    
    if not booking or not booking.room or not booking.room.hotel:
        return False
    
    return booking.room.hotel.user_id == user.id
