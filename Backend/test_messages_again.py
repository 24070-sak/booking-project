from app import create_app
from app.extensions import db
from app.models.message import Message
import datetime

app = create_app()

with app.app_context():
    count_before = Message.query.count()
    print(f"Messages before: {count_before}")
