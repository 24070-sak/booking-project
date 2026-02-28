from app import create_app
from app.extensions import db
from app.models.hotel import Hotel

app = create_app()
with app.app_context():
    hotels = Hotel.query.all()
    for h in hotels:
        print(f"Hotel: {h.name}, views: {h.views}, unique: {h.unique_visitors}, bounce: {h.bounce_rate}")
    
