import sqlite3
import os

# Adjust path to where booking.db is located relative to this script
DB_PATH = 'booking.db'

def add_column(cursor, table_name, column_name, column_type, default_value):
    try:
        cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type} DEFAULT {default_value}")
        print(f"Added column {column_name} to {table_name}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"Column {column_name} already exists in {table_name}")
        else:
            print(f"Error adding {column_name}: {e}")

if not os.path.exists(DB_PATH):
    print(f"Database not found at {DB_PATH}")
else:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    add_column(cursor, 'hotels', 'views', 'INTEGER', 0)
    add_column(cursor, 'hotels', 'unique_visitors', 'INTEGER', 0)
    add_column(cursor, 'hotels', 'bounce_rate', 'INTEGER', 0)

    conn.commit()
    conn.close()
    print("Database schema updated.")
