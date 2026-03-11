from app import create_app
from app.models.hotel import Hotel

app = create_app()

with app.app_context():
    hotels = Hotel.query.all()
    for h in hotels:
        print(f"Hotel {h.id}: {h.name}, Owner: {h.user_id}")
