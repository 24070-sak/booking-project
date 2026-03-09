import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

def update_user():
    with app.app_context():
        # Update abas (you said john america but you meant abaas@america.com who I created before)
        user = User.query.filter_by(email="abaas@america.com").first()
        if user:
            # Updating to a more European-looking cartoon using dicebear
            user.profile_picture = "https://api.dicebear.com/7.x/pixel-art/svg?seed=John&hair=short02&skinColor=f8d2b2"
            
            # Since you called him "John America", let's update his name too
            user.first_name = "John"
            user.last_name = "America"
            db.session.commit()
            print("Successfully updated user profile for John America (abaas@america.com).")
        else:
            print("User abaas@america.com not found.")
        
        # Ensure all are clients
        users = User.query.filter(User.email.in_(["abaas@america.com", "sak@client.com", "rahim@gmail.com", "sandrela@gmail.com"])).all()
        for u in users:
            u.role = 'client'
            u.access_control_center = False
            
        db.session.commit()
        print("Done.")

if __name__ == "__main__":
    update_user()
