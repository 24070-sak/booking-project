import sqlite3
import os

db_paths = ["booking.db", "instance/booking.db"]

for path in db_paths:
    full_path = os.path.join(os.getcwd(), path)
    if not os.path.exists(full_path):
        # Try path relative to Backend if we are in Backend
        full_path = os.path.join("/home/sak/Desktop/booking project v2/booking-project/Backend", path)
        if not os.path.exists(full_path):
            print(f"Skipping {full_path}: File not found")
            continue
    
    print(f"Checking {full_path}...")
    try:
        conn = sqlite3.connect(full_path)
        cursor = conn.cursor()
        
        # Get existing columns
        cursor.execute("PRAGMA table_info(notifications)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if "sender_id" not in columns:
            print(f"Adding column sender_id to {path}...")
            cursor.execute("ALTER TABLE notifications ADD COLUMN sender_id INTEGER")
            print(f"Successfully added column to {path}")
        else:
            print(f"Column sender_id already exists in {path}")
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error processing {path}: {e}")
