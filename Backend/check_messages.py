from app import create_app
from app.extensions import db
from app.models.message import Message
from app.models.user import User

app = create_app()

with app.app_context():
    # Let's see manager ID
    manager = User.query.filter_by(role='manager').first()
    if manager:
        print(f"Manager ID: {manager.id}, Name: {manager.first_name}")
        messages = Message.query.filter((Message.receiver_id == manager.id) | (Message.sender_id == manager.id)).all()
        for m in messages:
            print(f"Message ID: {m.id}, Sender: {m.sender_id}, Receiver: {m.receiver_id}, Content: {m.content}")
    else:
        print("No manager found")
