import sqlite3
import random

# Connect to the database
conn = sqlite3.connect('booking.db')
cur = conn.cursor()

# Diverse set of Unsplash images for hotels and rooms
hotel_images = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    "https://images.unsplash.com/photo-1551882547-ff43c63faf76?w=800",
    "https://images.unsplash.com/photo-1521783988139-89397d700ed8?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?w=800",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800",
    "https://images.unsplash.com/photo-1517840901100-8179e982ad93?w=800"
]

room_images = [
    "https://images.unsplash.com/photo-1611892441032-41aae0a4f6d4?w=800",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?w=800",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
    "https://images.unsplash.com/photo-1560185016-df41ac1e4ebc?w=800",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800"
]

# Update Hotels
cur.execute("SELECT id FROM hotels")
hotel_ids = [row[0] for row in cur.fetchall()]
for hid in hotel_ids:
    cur.execute("UPDATE hotels SET image_url = ? WHERE id = ?", (random.choice(hotel_images), hid))

# Update Rooms
cur.execute("SELECT id FROM rooms")
room_ids = [row[0] for row in cur.fetchall()]
for rid in room_ids:
    cur.execute("UPDATE rooms SET image_url = ? WHERE id = ?", (random.choice(room_images), rid))

# Clean up room_images table
cur.execute("UPDATE room_images SET image_url = ? WHERE image_url IS NULL OR image_url = '' OR image_url LIKE 'data:%'", (random.choice(room_images),))

conn.commit()
conn.close()
print("All hotels and rooms images updated with valid Unsplash URLs.")
