from app import create_app, db
from app.models.payment import Payment
from app.models.review import Review
from app.models.booking import Booking
from app.models.room import Room
from app.models.user import User
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Seeding Dashboard Data...")

    # Ensure we have bookings to attach payments to
    bookings = Booking.query.all()
    if not bookings:
        print("No bookings found! Please verify bookings exist first.")
        # Create a dummy booking if needed
        # ... logic to create booking ...
    
    # Clear existing payments and reviews to avoid duplicates if re-run
    # db.session.query(Payment).delete()
    # db.session.query(Review).delete()
    # db.session.commit()

    # Create Payments
    print(f"Found {len(bookings)} bookings.")
    for i, booking in enumerate(bookings):
        # Check if payment exists
        existing_payment = Payment.query.filter_by(booking_id=booking.id).first()
        if not existing_payment:
            payment = Payment(
                booking_id=booking.id,
                amount=booking.total_price,
                currency='EUR',
                payment_method='credit_card',
                transaction_id=f'TXN_{booking.booking_reference}',
                status='completed',
                paid_at=datetime.utcnow(),
                created_at=datetime.utcnow()
            )
            db.session.add(payment)
            print(f"Added payment for booking {booking.booking_reference}")

    # Create Reviews
    # We need users and rooms
    users = User.query.all()
    rooms = Room.query.all()
    
    if users and rooms:
        # Create a few reviews
        reviews_data = [
            (5, "Excellent séjour, chambre magnifique !", True),
            (4, "Très bien, mais un peu bruyant.", True),
            (3, "Moyen, le service pourrait être amélioré.", False)
        ]
        
        for i, (rating, comment, verified) in enumerate(reviews_data):
            user = users[i % len(users)]
            room = rooms[i % len(rooms)]
            
            # Check for existing review (simplistic check)
            existing_review = Review.query.filter_by(user_id=user.id, room_id=room.id).first()
            
            if not existing_review:
                review = Review(
                    user_id=user.id,
                    room_id=room.id,
                    rating=rating,
                    comment=comment,
                    is_verified=verified,
                    created_at=datetime.utcnow() - timedelta(days=i)
                )
                db.session.add(review)
                print(f"Added review by {user.first_name} for room {room.name}")
    
    db.session.commit()
    print("Dashboard Data Seeded Successfully!")
