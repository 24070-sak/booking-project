import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'app', 'booking.db') # Assuming default path
# Check where config points to.
# Let's check config.py first, but I'll assume standard locations or check the file system.

# I will assume the db is at instance/booking.db or directly in app. 
# Let's search for .db files.
