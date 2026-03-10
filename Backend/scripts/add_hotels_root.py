import sqlite3
import random
from datetime import datetime

# Connect to the database
conn = sqlite3.connect('booking.db')
cur = conn.cursor()

# "root" user ID is 6
user_id = 6

# Hotel data
hotel_names = [
    "Sahara Sands Resort", "Atlantic Breeze Hotel", "Oasis Palace",
    "Chinguetti Heritage Inn", "Nouakchott Central Hotel", "Rosso River View",
    "Argone Dunes Hotel", "Tidjikja Palms", "Kiffa Royal", "Zouerat Iron View"
]
cities = ["Nouakchott", "Nouadhibou", "Rosso", "Atar", "Chinguetti", "Akjoujt", "Kiffa", "Tidjikja", "Zouerat", "Aioun"]
images = [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    "https://images.unsplash.com/photo-1551882547-ff43c63faf76?w=800",
    "https://images.unsplash.com/photo-1521783988139-89397d700ed8?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?w=800",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
]

# Get the max room number to avoid unique constraint violation
cur.execute("SELECT MAX(CAST(room_number AS INTEGER)) FROM rooms")
max_room_num = cur.fetchone()[0] or 100

for i in range(10):
    name = hotel_names[i]
    location = cities[i]
    img = images[i]
    rating = round(random.uniform(4.0, 5.0), 1)
    description = f"Experience luxury and comfort at {name}, located in the heart of {location}."
    
    # Insert Hotel
    cur.execute("""
        INSERT INTO hotels (name, location, description, image_url, rating, user_id, views, unique_visitors, bounce_rate, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (name, location, description, img, rating, user_id, 0, 0, 0, datetime.utcnow()))
    
    hotel_id = cur.lastrowid
    
    # Insert a room for this hotel so it shows availability and price
    room_name = f"{name} - Standard Room"
    max_room_num += 1
    room_number = str(max_room_num)
    price = random.randint(200, 600)
    
    # RoomType 1 is 'Standard'
    cur.execute("""
        INSERT INTO rooms (room_number, name, description, room_type_id, hotel_id, price_per_night, floor, size_sqm, bed_type, max_guests, is_available, image_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (room_number, room_name, f"Standard comfortable room at {name}", 1, hotel_id, price, 1, 30.0, "King", 2, 1, img, datetime.utcnow(), datetime.utcnow()))

conn.commit()
conn.close()
print("10 hotels added successfully for root.")
