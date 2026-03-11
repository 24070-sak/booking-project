from app import create_app
from flask_jwt_extended import create_access_token
from app.models.user import User

app = create_app()

with app.app_context():
    # Find any user
    user = User.query.first()
    if user:
        token = create_access_token(identity=str(user.id))
        print(f"export TEST_TOKEN={token}")
    else:
        print("No users in DB")
