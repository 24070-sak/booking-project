import sqlite3

def run():
    conn = sqlite3.connect('booking.db')
    cursor = conn.cursor()
    
    # Check for reply in reviews
    cursor.execute("PRAGMA table_info(reviews)")
    columns = [c[1] for c in cursor.fetchall()]
    if 'reply' not in columns:
        print("Adding 'reply' column to 'reviews' table...")
        cursor.execute("ALTER TABLE reviews ADD COLUMN reply TEXT")
    else:
        print("'reply' column already exists in 'reviews' table.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    run()
