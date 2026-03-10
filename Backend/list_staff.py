import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app import create_app
from app.models.user import User

app = create_app()

def list_managers():
    with app.app_context():
        # List all admins and managers
        staff = User.query.filter(User.role.in_(['admin', 'manager'])).all()
        for s in staff:
            print(f"Role: {s.role}, Email: {s.email}, Name: {s.first_name} {s.last_name}")

if __name__ == "__main__":
    list_managers()
