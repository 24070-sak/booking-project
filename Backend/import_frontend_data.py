from app import create_app
from app.extensions import db
from app.models.room import Room, RoomType, Amenity
from app.models.hotel import Hotel
from app.models.user import User
import random

def import_data():
    app = create_app()
    with app.app_context():
        print("🚀 Démarrage de la restructuration des données...")
        
        # 0. Nettoyer les données existantes (pour éviter les doublons/conflits)
        print("🧹 Nettoyage des anciennes données...")
        
        # Désactiver les vérifications de clé étrangère
        db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 0'))
        
        Room.query.delete()
        Hotel.query.delete()
        User.query.delete() # Clean users too
        # Also clear association tables if needed, or rely on cascade
        db.session.execute(db.text('TRUNCATE TABLE room_amenities'))
        Amenity.query.delete()
        RoomType.query.delete()
        
        db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 1'))
        db.session.commit()

        # 1. Type de chambre par défaut
        room_type = RoomType.query.filter_by(name='Standard').first()
        if not room_type:
            room_type = RoomType(name='Standard', base_price=50, max_occupancy=2)
            db.session.add(room_type)
            # 1.5 Créer des équipements (Amenities)
            amenities_list = [
                {'name': 'WiFi Gratuit', 'icon': 'fa-wifi'},
                {'name': 'Climatisation', 'icon': 'fa-snowflake'},
                {'name': 'TV Écran Plat', 'icon': 'fa-tv'},
                {'name': 'Petit-déjeuner inclus', 'icon': 'fa-mug-hot'},
                {'name': 'Vue sur mer', 'icon': 'fa-water'},
                {'name': 'Coffre-fort', 'icon': 'fa-vault'},
                {'name': 'Minibar', 'icon': 'fa-wine-bottle'},
                {'name': 'Service de chambre', 'icon': 'fa-bell-concierge'}
            ]
            
            created_amenities = []
            for am_data in amenities_list:
                am = Amenity(name=am_data['name'], icon=am_data['icon'])
                db.session.add(am)
                created_amenities.append(am)
            
            db.session.commit()

        # 1.8 Créer les utilisateurs par défaut
        print("👤 Création des utilisateurs...")
        
        # Admin
        admin = User(
            email='admin@hotel.com',
            first_name='Admin',
            last_name='System',
            role='admin',
            phone='+222 12 34 56 78'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Manager
        manager = User(
            email='manager@hotel.com',
            first_name='Manager',
            last_name='Hotel',
            role='manager',
            phone='+222 22 33 44 55'
        )
        manager.set_password('manager123')
        db.session.add(manager)
        
        # Client Test
        client = User(
            email='client@test.com',
            first_name='Jean',
            last_name='Dupont',
            role='client',
            phone='+222 33 44 55 66'
        )
        client.set_password('password123')
        db.session.add(client)
        
        db.session.commit()

        # 2. Données des Hôtels
        hotels_data = [
            {
                "name": "Hotel Azalai",
                "location": "Nouakchott",
                "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                "rating": 4.5,
                "description": "L'hôtel Azalaï Nouakchott est situé en plein centre-ville...",
                "rooms": [
                    {"name": "Chambre Standard", "price": 120, "img": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"},
                    {"name": "Suite Junior", "price": 180, "img": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"},
                    {"name": "Suite Présidentielle", "price": 350, "img": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"}
                ]
            },
            {
                "name": "Hotel Monotel",
                "location": "Nouakchott",
                "image_url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
                "rating": 4.2,
                "description": "Monotel Dar El Barka offre un cadre luxueux...",
                "rooms": [
                    {"name": "Chambre Double", "price": 95, "img": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"},
                    {"name": "Chambre Vue Piscine", "price": 115, "img": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"}
                ]
            },
            {
                "name": "Hotel Tfeila",
                "location": "Nouadhibou",
                "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
                "rating": 4.0,
                "description": "Hôtel historique avec vue sur la mer...",
                "rooms": [
                    {"name": "Chambre Classique", "price": 85, "img": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"}
                ]
            },
            {
                "name": "Hotel Sahara",
                "location": "Atar",
                "image_url": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
                "rating": 4.3,
                "description": "Au cœur du désert, le confort moderne...",
                "rooms": [
                    {"name": "Bungalow", "price": 75, "img": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"},
                    {"name": "Tente de Luxe", "price": 90, "img": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800"}
                ]
            }
        ]

        count_hotels = 0
        count_rooms = 0

        for h_data in hotels_data:
            # Créer l'hôtel
            hotel = Hotel(
                name=h_data['name'],
                location=h_data['location'],
                description=h_data['description'],
                image_url=h_data['image_url'],
                rating=h_data['rating']
            )
            db.session.add(hotel)
            db.session.flush() # Pour avoir l'ID
            count_hotels += 1
            print(f"🏨 Créé: {hotel.name}")

            # Créer les chambres pour cet hôtel
            for r_data in h_data['rooms']:
                room_number = f"R-{random.randint(10000, 99999)}"
                room = Room(
                    room_number=room_number,
                    name=r_data['name'],
                    description=f"Belle chambre au {hotel.name}",
                    room_type_id=room_type.id,
                    hotel_id=hotel.id,
                    price_per_night=r_data['price'],
                    image_url=r_data['img'],
                    is_available=True,
                    max_guests=2
                )
                
                # Ajouter 3 à 6 équipements aléatoires
                room.amenities = random.sample(created_amenities, k=random.randint(3, 6))
                
                db.session.add(room)
                count_rooms += 1

        db.session.commit()
        print(f"\n✨ Restructuration terminée !")
        print(f"   - {count_hotels} Hôtels créés")
        print(f"   - {count_rooms} Chambres créées")

if __name__ == '__main__':
    import_data()
