import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

def update_permissions():
    with app.app_context():
        target_emails = [
            "abaas@america.com",
            "sak@client.com",
            "rahim@gmail.com",
            "sandrela@gmail.com"
        ]
        
        users = User.query.filter(User.email.in_(target_emails)).all()
        for u in users:
            u.access_dashboard = False
            u.role = 'client'
            print(f"Updated {u.email}: access_dashboard=False")
        
        db.session.commit()
        print("\nAll users in the system:")
        all_users = User.query.all()
        for u in all_users:
            # We can't see plain text passwords, but for the ones we created, we know it's 'password'
            # For the admin it's also probably 'admin123' based on typical dev setups or what user provided before
            print(f"Role: {u.role:10} | Email: {u.email:25} | Dashboard Access: {str(u.access_dashboard)}")

if __name__ == "__main__":
    update_permissions()
