import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

def create_users():
    with app.app_context():
        users_data = [
            {
                "email": "abaas@america.com",
                "first_name": "Abaas",
                "last_name": "Amer",
                "username": "abaas_america",
                "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=abaas"
            },
            {
                "email": "sak@client.com",
                "first_name": "Sak",
                "last_name": "Client",
                "username": "sak_client",
                "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=sak"
            },
            {
                "email": "rahim@gmail.com",
                "first_name": "Rahim",
                "last_name": "Ouss",
                "username": "rahim_ouss",
                "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=rahim"
            },
            {
                "email": "sandrela@gmail.com",
                "first_name": "Sandrela",
                "last_name": "Rose",
                "username": "sandrela_rose",
                "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=sandrela"
            }
        ]

        for u in users_data:
            existing_user = User.query.filter_by(email=u["email"]).first()
            if existing_user:
                print(f"User {u['email']} already exists. Updating profile picture and password.")
                existing_user.profile_picture = u["profile_picture"]
                existing_user.set_password('password') # Password is "password"
                existing_user.is_email_verified = True
                existing_user.role = 'client'
                existing_user.access_dashboard = True
            else:
                new_user = User(
                    email=u["email"],
                    first_name=u["first_name"],
                    last_name=u["last_name"],
                    username=u["username"],
                    profile_picture=u["profile_picture"],
                    is_email_verified=True,
                    role='client',
                    access_dashboard=True
                )
                new_user.set_password('password') # Password is "password"
                db.session.add(new_user)
                print(f"Created user {u['email']}.")
        
        db.session.commit()
        print("Done.")

if __name__ == "__main__":
    create_users()
