from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    tables = ['users', 'hotels', 'rooms', 'bookings', 'payments', 'messages', 'reviews', 'notifications', 'faqs']
    
    for table_name in tables:
        try:
            # PostgreSQL command to manually sync the sequence with the max id value in a table
            query = f"SELECT setval('{table_name}_id_seq', COALESCE((SELECT MAX(id)+1 FROM {table_name}), 1), false);"
            db.session.execute(text(query))
            db.session.commit()
            print(f"Sequence fixed for {table_name}")
        except Exception as e:
            db.session.rollback()
            print(f"Error fixing sequence for {table_name}: {e}")

