from app import create_app
from app.extensions import db
from app.models.room import Room, RoomType, Amenity
from app.models.hotel import Hotel
from app.models.user import User
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.review import Review
from app.models.message import Message
import random
from datetime import datetime, timedelta

def seed_all():
    app = create_app()
    with app.app_context():
        print("🚀 Démarrage du peuplement complet de la base de données...")
        
        # 1. Nettoyage (DÉSACTIVÉ pour conserver les données)
        print("ℹ️ Conservation des données existantes (le nettoyage est désactivé).")
        # if 'sqlite' in db.engine.name:
        #     db.session.execute(db.text('PRAGMA foreign_keys = OFF'))
        # else:
        #     db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 0'))
            
        # Message.query.delete()
        # Payment.query.delete()
        # Review.query.delete()
        # Booking.query.delete()
        # Room.query.delete()
        # Hotel.query.delete()
        # User.query.delete()
        # db.session.execute(db.text('DELETE FROM room_amenities'))
        # Amenity.query.delete()
        # RoomType.query.delete()
        
        # if 'sqlite' in db.engine.name:
        #     db.session.execute(db.text('PRAGMA foreign_keys = ON'))
        # else:
        #     db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 1'))
        # db.session.commit()

        # 2. Amenities and Room Types
        print("🛠️ Checking types and amenities...")
        room_type = RoomType.query.filter_by(name='Standard').first()
        if not room_type:
            room_type = RoomType(name='Standard', base_price=50, max_occupancy=2)
            db.session.add(room_type)
        
        amenities_list = [
            {'name': 'WiFi Gratuit', 'icon': 'fa-wifi'},
            {'name': 'Climatisation', 'icon': 'fa-snowflake'},
            {'name': 'TV Écran Plat', 'icon': 'fa-tv'},
            {'name': 'Petit-déjeuner inclus', 'icon': 'fa-mug-hot'},
            {'name': 'Vue sur mer', 'icon': 'fa-water'},
            {'name': 'Service de chambre', 'icon': 'fa-bell-concierge'}
        ]
        created_amenities = []
        for am_data in amenities_list:
            am = Amenity.query.filter_by(name=am_data['name']).first()
            if not am:
                am = Amenity(name=am_data['name'], icon=am_data['icon'])
                db.session.add(am)
            created_amenities.append(am)
        db.session.commit()

        # 3. Users
        print("👤 Checking users...")
        # Admin / Owner 1
        admin1 = User.query.filter_by(email='24070@supnum.mr').first()
        if not admin1:
            admin1 = User(
                email='24070@supnum.mr',
                first_name='Admin',
                last_name='Sak',
                role='admin',
                phone='+222 20103014',
                username='admin24070',
                access_dashboard=True,
                access_control_center=True
            )
            admin1.set_password('1234')
            db.session.add(admin1)

        # Admin / Owner 2 (Abdurrahmane)
        admin2 = User.query.filter_by(email='24102@supnum.mr').first()
        if not admin2:
            admin2 = User(
                email='24102@supnum.mr',
                first_name='Abdurrahmane',
                last_name='Sak',
                role='admin',
                phone='+222 20103014',
                username='abdurrahmane24102',
                access_dashboard=True,
                access_control_center=True
            )
            admin2.set_password('1234')
            db.session.add(admin2)

        # Standard Client
        client = User.query.filter_by(email='client@test.com').first()
        if not client:
            client = User(
                email='client@test.com',
                first_name='Jean',
                last_name='Dupont',
                role='client',
                phone='+222 33 44 55 66',
                username='jdupont',
                access_dashboard=False
            )
            client.set_password('password123')
            db.session.add(client)
        db.session.commit()

        # 4. Hotels and Rooms
        print("🏨 Checking hotels and rooms...")
        hotels_data = [
            {
                "name": "Hotel Azalai",
                "location": "Nouakchott",
                "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                "rating": 4.5,
                "description": "L'hôtel Azalaï Nouakchott est situé en plein centre-ville...",
                "rooms": [
                    {"name": "Chambre Standard", "price": 120},
                    {"name": "Suite Junior", "price": 180}
                ]
            },
            {
                "name": "Hotel Monotel",
                "location": "Nouakchott",
                "image_url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
                "rating": 4.2,
                "description": "Monotel Dar El Barka offre un cadre luxueux...",
                "rooms": [
                    {"name": "Chambre Double", "price": 95}
                ]
            },
            {
                "name": "Hotel Tfeila",
                "location": "Nouadhibou",
                "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
                "rating": 4.0,
                "description": "Hôtel historique avec vue sur la mer...",
                "rooms": [
                    {"name": "Chambre Classique", "price": 85}
                ]
            },
            {
                "name": "Hotel Sahara",
                "location": "Atar",
                "image_url": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
                "rating": 4.3,
                "description": "Au cœur du désert, le confort moderne...",
                "rooms": [
                    {"name": "Bungalow", "price": 75}
                ]
            }
        ]

        all_rooms = list(Room.query.all())
        
        for h_data in hotels_data:
            hotel = Hotel.query.filter_by(name=h_data['name']).first()
            if not hotel:
                hotel = Hotel(
                    name=h_data['name'],
                    location=h_data['location'],
                    description=h_data['description'],
                    image_url=h_data['image_url'],
                    rating=h_data['rating'],
                    user_id=admin1.id # Linked to the admin user
                )
                db.session.add(hotel)
                db.session.flush()
                print(f"  Added hotel: {hotel.name}")

            for r_data in h_data['rooms']:
                room = Room.query.filter_by(name=r_data['name'], hotel_id=hotel.id).first()
                if not room:
                    room = Room(
                        room_number=f"R-{random.randint(100, 999)}",
                        name=r_data['name'],
                        description=f"Belle chambre au {hotel.name}",
                        room_type_id=room_type.id,
                        hotel_id=hotel.id,
                        price_per_night=r_data['price'],
                        image_url="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                        is_available=True,
                        max_guests=2
                    )
                    room.amenities = random.sample(created_amenities, k=min(3, len(created_amenities)))
                    db.session.add(room)
                    all_rooms.append(room)
                    print(f"    Added room: {room.name}")
        db.session.commit()

        # 5. Bookings and Payments (for dashboard stats)
        print("📅 Checking bookings and payments...")
        for i in range(5):
            ref = f"BK-{1000 + i}" # Deterministic ref for seeding
            existing_booking = Booking.query.filter_by(booking_reference=ref).first()
            if not existing_booking:
                room = random.choice(all_rooms)
                days_ago = random.randint(1, 30)
                booking = Booking(
                    user_id=client.id,
                    room_id=room.id,
                    check_in_date=(datetime.utcnow() - timedelta(days=days_ago)).date(),
                    check_out_date=(datetime.utcnow() - timedelta(days=days_ago-2)).date(),
                    total_price=room.price_per_night * 2,
                    num_guests=2,
                    status='completed',
                    booking_reference=ref,
                    created_at=datetime.utcnow() - timedelta(days=days_ago+2)
                )
                db.session.add(booking)
                db.session.flush()

                payment = Payment(
                    booking_id=booking.id,
                    amount=booking.total_price,
                    currency='EUR',
                    payment_method='credit_card',
                    transaction_id=f'TXN_{booking.booking_reference}',
                    status='completed',
                    paid_at=datetime.utcnow() - timedelta(days=days_ago+1)
                )
                db.session.add(payment)
                print(f"    Added booking: {ref}")

        db.session.commit()

        # 6. Messages
        print("💬 Checking messages...")
        msg_subj1 = "Question sur ma réservation"
        if not Message.query.filter_by(subject=msg_subj1).first():
            msg1 = Message(
                sender_id=client.id,
                receiver_id=admin1.id,
                subject=msg_subj1,
                content="Bonjour, j'aimerais savoir si le petit déjeuner est inclus.",
                created_at=datetime.utcnow() - timedelta(hours=5)
            )
            db.session.add(msg1)
            print("  Added message 1")

        msg_subj2 = "Re: Question sur ma réservation"
        if not Message.query.filter_by(subject=msg_subj2).first():
            msg2 = Message(
                sender_id=admin1.id,
                receiver_id=client.id,
                subject=msg_subj2,
                content="Oui, bien sûr !",
                created_at=datetime.utcnow() - timedelta(hours=4)
            )
            db.session.add(msg2)
            print("  Added message 2")
        
        db.session.commit()

        print("✨ Seeding completed successfully!")

if __name__ == '__main__':
    seed_all()
