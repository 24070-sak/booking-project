import requests

# User 1 token
TOKEN_USER="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3MzE5NDk2MiwianRpIjoiYWEzNDlkNGYtNzIzOS00MTMwLTk3OWItZWNhODcyNWM0NmI0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NzMxOTQ5NjIsImNzcmYiOiI3ZGJiZWEzNi1lNjk3LTRjMzMtOTRkZS0wMzg1M2M5YWFhNzMiLCJleHAiOjE3NzMxOTg1NjJ9.mgfUVKBjjOnCwFzT_KOqIKpRwISYaxg1wPufgPce-zI"

from app import create_app
from flask_jwt_extended import create_access_token
from app.models.user import User

app = create_app()
with app.app_context():
    manager = User.query.filter_by(role='manager').first()
    token_manager = create_access_token(identity=str(manager.id))

print("Sending message from User to Manager...")
headers = {"Authorization": f"Bearer {TOKEN_USER}", "Content-Type": "application/json"}
data = {"subject": "Test Contact", "content": "I want to ask a question", "receiver_id": 3}
res = requests.post("http://localhost:5000/api/messages", headers=headers, json=data)
print("Sent:", res.json())

print("Fetching manager messages...")
mgr_headers = {"Authorization": f"Bearer {token_manager}"}
res = requests.get("http://localhost:5000/api/messages", headers=mgr_headers)
msgs = res.json().get('messages', [])
print(f"Manager has {len(msgs)} messages. The last one is from {msgs[0]['sender_id']} with content {msgs[0]['content']}")
for m in msgs:
    if m['sender_id'] == 1:
        print(f"Found message from user 1! Receiver ID: {m['receiver_id']}")
