from app import create_app
from app.extensions import db
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User
from flask_jwt_extended import create_access_token

app = create_app()

with app.test_client() as client:
    with app.app_context():
        # Get booking 9 to find its owner
        booking = Booking.query.get(9)
        if booking:
            user_id = booking.user_id
            print(f"Booking 9 belongs to user {user_id}")
            token = create_access_token(identity=str(user_id))
            
            # Now simulate request
            headers = {"Authorization": f"Bearer {token}"}
            import io
            data = {
                'booking_id': 9,
                'bank_app': 'bankily',
                'transaction_phone': '12345678',
                'screenshot': (io.BytesIO(b"fake image data"), 'test.png')
            }
            
            resp = client.post("/api/payments/submit-local", headers=headers, data=data, content_type='multipart/form-data')
            print(f"Status: {resp.status_code}")
            print(f"Data: {resp.data.decode('utf-8')}")
        else:
            print("Booking 9 not found")
