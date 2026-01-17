from app import create_app
from app.models.user import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print("--- Liste des utilisateurs ---")
    for u in users:
        print(f"Email: {u.email}, Role: {u.role}")
    print("------------------------------")
