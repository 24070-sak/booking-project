import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'booking.db')
print(f"Connecting to database at {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT")
    print("Column profile_picture added successfully.")
except sqlite3.OperationalError as e:
    print(f"Error (likely already exists): {e}")

conn.commit()
conn.close()
