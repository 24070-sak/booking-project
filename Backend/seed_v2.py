import os
from app import create_app
from app.extensions import db
from app.models.room import Room, RoomType, Amenity
from app.models.hotel import Hotel
from app.models.user import User
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.review import Review
from app.models.message import Message
from app.models.notification import Notification
import random
from datetime import datetime, timedelta

def seed_v2():
    app = create_app()
    with app.app_context():
        print("🧨 Wiping database for fresh start...")
        
        # Disable foreign key checks for clean wipe
        if 'sqlite' in db.engine.name:
            db.session.execute(db.text('PRAGMA foreign_keys = OFF'))
        else:
            db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 0'))
            
        Notification.query.delete()
        Message.query.delete()
        Payment.query.delete()
        Review.query.delete()
        Booking.query.delete()
        db.session.execute(db.text('DELETE FROM room_amenities'))
        Room.query.delete()
        Hotel.query.delete()
        User.query.delete()
        Amenity.query.delete()
        RoomType.query.delete()
        
        if 'sqlite' in db.engine.name:
            db.session.execute(db.text('PRAGMA foreign_keys = ON'))
        else:
            db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 1'))
        db.session.commit()

        print("✅ Database wiped.")

        # 1. Base Data: Amenities and Room Types
        print("🛠️ Creating types and amenities...")
        room_types = {
            'Standard': RoomType(name='Standard', base_price=60, max_occupancy=2),
            'Deluxe': RoomType(name='Deluxe', base_price=120, max_occupancy=2),
            'Suite Royale': RoomType(name='Suite Royale', base_price=350, max_occupancy=4)
        }
        for rt in room_types.values():
            db.session.add(rt)
        
        amenities_list = [
            Amenity(name='WiFi Haut Débit', icon='fa-wifi'),
            Amenity(name='Climatisation', icon='fa-snowflake'),
            Amenity(name='Smart TV', icon='fa-tv'),
            Amenity(name='Petit-déjeuner Gourmet', icon='fa-mug-hot'),
            Amenity(name='Vue Panoramique', icon='fa-water'),
            Amenity(name='Service Conciergerie 24/7', icon='fa-bell-concierge'),
            Amenity(name='Piscine Privée', icon='fa-person-swimming'),
            Amenity(name='Mini-bar Premium', icon='fa-wine-glass')
        ]
        for am in amenities_list:
            db.session.add(am)
            
        db.session.commit()

        # 2. Main Admin
        print("👤 Creating Admin...")
        admin = User(
            email='admin@hotely.mr',
            first_name='Admin',
            last_name='Hotely',
            role='admin',
            phone='+222 20000000',
            username='admin',
            access_dashboard=True,
            access_control_center=True,
            is_active=True,
            is_email_verified=True,
            profile_picture='/static/uploads/admin_profile.png'
        )
        admin.set_password('admin')
        db.session.add(admin)

        # 3. John America (European User)
        print("👤 Creating John America...")
        john = User(
            email='john@america.com',
            first_name='John',
            last_name='America',
            role='client',
            phone='+1 555 123456',
            username='john_america',
            access_dashboard=False,
            is_active=True,
            is_email_verified=True,
            profile_picture='/static/uploads/john_america.png'
        )
        john.set_password('password')
        db.session.add(john)

        # 4. Famous Mauritanian Hotels
        print("🏨 Creating Famous Hotels...")
        hotels_config = [
            {
                "name": "Hôtel Tfeila",
                "email": "tfeila@hotely.mr",
                "pwd": "tfeila",
                "location": "Avenue Charles de Gaulle, Nouakchott",
                "img": "/static/uploads/hotel_tfeila.png",
                "logo": "/static/uploads/logo_tfeila.png",
                "rating": 4.8,
                "desc": "L'un des hôtels les plus prestigieux de Nouakchott, alliant luxe moderne et hospitalité mauritanienne traditionnelle."
            },
            {
                "name": "Azalaï Hôtel",
                "email": "azalai@hotely.mr",
                "pwd": "azalai",
                "location": "Centre-ville, Nouakchott",
                "img": "/static/uploads/hotel_azalai.png",
                "logo": "/static/uploads/logo_azalai.png",
                "rating": 4.9,
                "desc": "Un havre de paix au coeur de la capitale, offrant des services haut de gamme pour les voyageurs d'affaires et de loisirs."
            },
            {
                "name": "Monotel Dar El Barka",
                "email": "monotel@hotely.mr",
                "pwd": "monotel",
                "location": "Quartier Tevragh Zeina, Nouakchott",
                "img": "/static/uploads/hotel_monotel.png",
                "logo": "/static/uploads/logo_monotel.png",
                "rating": 4.7,
                "desc": "Connu pour son élégance discrète et son jardin magnifique, le Monotel est une référence en Mauritanie."
            },
            {
                "name": "Hôtel Semiramis",
                "email": "semiramis@hotely.mr",
                "pwd": "semiramis",
                "location": "Tevragh Zeina, Nouakchott",
                "img": "/static/uploads/hotel_semiramis.png",
                "logo": "/static/uploads/logo_semiramis.png",
                "rating": 4.6,
                "desc": "Un hôtel moderne et chaleureux, idéalement situé pour explorer la ville."
            },
            {
                "name": "Mauricenter Hôtel",
                "email": "mauricenter@hotely.mr",
                "pwd": "mauricenter",
                "location": "Avenue Moktar Ould Daddah, Nouakchott",
                "img": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
                "logo": "/static/uploads/logo_mauricenter.png",
                "rating": 4.5,
                "desc": "Complexe moderne offrant des chambres spacieuses et un centre d'affaires de pointe."
            },
            {
                "name": "Hôtel Halima",
                "email": "halima@hotely.mr",
                "pwd": "halima",
                "location": "Près du Palais des Congrès, Nouakchott",
                "img": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
                "logo": "/static/uploads/logo_halima.png",
                "rating": 4.4,
                "desc": "Une hospitalité légendaire dans un cadre calme et sécurisé."
            },
            {
                "name": "Hôtel Sahel",
                "email": "sahel@hotely.mr",
                "pwd": "sahel",
                "location": "Route de la Plage, Nouakchott",
                "img": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                "logo": "/static/uploads/logo_sahel.png",
                "rating": 4.3,
                "desc": "Vivez l'expérience du désert avec tout le confort moderne, proche de l'Océan Atlantique."
            }
        ]

        for h_meta in hotels_config:
            # Create manager user
            manager = User(
                email=h_meta['email'],
                first_name=h_meta['name'].split()[0],
                last_name='Manager',
                role='manager',
                username=h_meta['email'].split('@')[0],
                access_dashboard=True,
                is_active=True,
                is_email_verified=True,
                profile_picture=h_meta['logo']
            )
            manager.set_password(h_meta['pwd'])
            db.session.add(manager)
            db.session.flush()

            # Create hotel
            hotel = Hotel(
                name=h_meta['name'],
                location=h_meta['location'],
                description=h_meta['desc'],
                image_url=h_meta['img'],
                rating=h_meta['rating'],
                user_id=manager.id
            )
            db.session.add(hotel)
            db.session.flush()

            # Add Rooms
            for i in range(1, 4):
                rtype_name = random.choice(list(room_types.keys()))
                rtype = room_types[rtype_name]
                
                room = Room(
                    room_number=f"{hotel.id}0{i}",
                    name=f"{rtype_name} - {h_meta['name']}",
                    description=f"Une magnifique chambre {rtype_name.lower()} avec tout le confort moderne.",
                    room_type_id=rtype.id,
                    hotel_id=hotel.id,
                    price_per_night=rtype.base_price + random.randint(10, 50),
                    image_url="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                    is_available=True,
                    max_guests=rtype.max_occupancy,
                    size_sqm=float(random.randint(25, 60))
                )
                room.amenities = random.sample(amenities_list, k=min(4, len(amenities_list)))
                db.session.add(room)

        db.session.commit()
        print("✨ Seeding completed successfully!")

if __name__ == '__main__':
    seed_v2()
