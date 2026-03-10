import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

def update_admin_managers():
    with app.app_context():
        # 1. Update Admin Profile Picture
        admin = User.query.filter_by(role='admin').first()
        if admin:
            admin.profile_picture = '/static/uploads/hotely_admin_logo.png'
            print("Admin profile picture updated to Hotely Administration logo.")
            
        # 2. Update Managers Profile Pictures
        managers = User.query.filter_by(role='manager').all()
        # Different sleek colors for manager logos (extracted from a professional palette)
        colors = ["006233", "C1272D", "f59e0b", "3b82f6", "8b5cf6", "ec4899", "14b8a6", "64748b"]
        for i, manager in enumerate(managers):
            # Use the UI Avatars API for high quality corporate typographic logos
            # We take the hotel name part from their email (e.g., monotel from monotel@hotely.mr)
            hotel_alias = manager.email.split('@')[0].capitalize()
            color = colors[i % len(colors)]
            
            # Use initials with a solid professional background color to look like customized hotel logos
            manager.profile_picture = f"https://ui-avatars.com/api/?name={hotel_alias}&background={color}&color=fff&size=256&bold=true&font-size=0.4"
            print(f"Updated manager {manager.email} logo with alias {hotel_alias}.")
            
        db.session.commit()
        print("Done.")

if __name__ == "__main__":
    update_admin_managers()
