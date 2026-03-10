from app import create_app
from app.models.user import User
from app.models.hotel import Hotel
import os

app = create_app()
with app.app_context():
    email = "tfeila@hotely.mr"
    user = User.query.filter_by(email=email).first()
    if not user:
        print(f"User {email} not found!")
    else:
        print(f"User found: ID={user.id}, Role={user.role}")
        hotels = Hotel.query.filter_by(user_id=user.id).all()
        print(f"Hotels found for this user: {len(hotels)}")
        for h in hotels:
            print(f" - {h.name} (ID: {h.id})")
        
        all_hotels = Hotel.query.all()
        print(f"\nTotal hotels in DB: {len(all_hotels)}")
        for h in all_hotels:
            owner_email = h.owner.email if h.owner else "No Owner"
            print(f" - {h.name} (ID: {h.id}, Owner: {owner_email}, Owner_ID: {h.user_id})")
