from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"Users found locally: {len(users)}")
    for u in users:
        print(f" - {u.email}")
