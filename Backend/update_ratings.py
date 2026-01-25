from app.app import create_app
from app.extensions import db
from app.models.hotel import Hotel
from app.models.review import Review
from app.models.room import Room
from sqlalchemy import func

app = create_app()

def update_all_hotel_ratings():
    with app.app_context():
        print("Updating hotel ratings...")
        hotels = Hotel.query.all()
        
        for hotel in hotels:
            # Calculate average rating from reviews linked to this hotel's rooms
            # Hotel -> Room -> Review
            avg_rating = db.session.query(func.avg(Review.rating))\
                .join(Room, Review.room_id == Room.id)\
                .filter(Room.hotel_id == hotel.id)\
                .scalar()
            
            if avg_rating is not None:
                hotel.rating = round(float(avg_rating), 1)
            else:
                hotel.rating = 0.0
                
            print(f"Hotel '{hotel.name}': New Rating = {hotel.rating}")
        
        db.session.commit()
        print("All hotel ratings updated successfully.")

if __name__ == "__main__":
    update_all_hotel_ratings()
