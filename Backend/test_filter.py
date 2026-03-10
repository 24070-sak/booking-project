from app import create_app
from app.models.hotel import Hotel
from app.models.user import User
import os

app = create_app()
with app.app_context():
    str_id = "3"
    int_id = 3
    
    print(f"Filtering with int ID {int_id}:")
    hotels_int = Hotel.query.filter_by(user_id=int_id).all()
    print(f"  Found {len(hotels_int)} hotels")
    
    print(f"\nFiltering with str ID '{str_id}':")
    hotels_str = Hotel.query.filter_by(user_id=str_id).all()
    print(f"  Found {len(hotels_str)} hotels")
    
    user = User.query.get(str_id)
    print(f"\nUser.query.get('{str_id}'): {user.email if user else 'Not found'}")
    if user:
        print(f"user.hotels count: {user.hotels.count()}")
