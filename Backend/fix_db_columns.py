import sqlite3
import os

db_paths = ["booking.db", "instance/booking.db"]

for path in db_paths:
    full_path = os.path.join(os.getcwd(), path)
    if not os.path.exists(full_path):
        print(f"Skipping {full_path}: File not found")
        continue
    
    print(f"Checking {full_path}...")
    try:
        conn = sqlite3.connect(full_path)
        cursor = conn.cursor()
        
        # Get existing columns
        cursor.execute("PRAGMA table_info(payments)")
        columns = [row[1] for row in cursor.fetchall()]
        
        new_columns = [
            ("transaction_phone", "VARCHAR(20)"),
            ("screenshot_url", "VARCHAR(500)"),
            ("bank_app", "VARCHAR(50)")
        ]
        
        for col_name, col_type in new_columns:
            if col_name not in columns:
                print(f"Adding column {col_name} to {path}...")
                cursor.execute(f"ALTER TABLE payments ADD COLUMN {col_name} {col_type}")
            else:
                print(f"Column {col_name} already exists in {path}")
        
        conn.commit()
        conn.close()
        print(f"Finished processing {path}")
    except Exception as e:
        print(f"Error processing {path}: {e}")
