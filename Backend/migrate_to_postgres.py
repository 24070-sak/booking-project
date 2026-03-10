from sqlalchemy import create_engine, MetaData
import sys
import os

def migrate():
    # Set up the paths
    backend_dir = '/home/sak/Desktop/booking-project/Backend'
    sys.path.append(backend_dir)
    os.chdir(backend_dir)
    
    sqlite_url = "sqlite:////home/sak/Desktop/booking-project/Backend/booking.db"
    pg_url = "postgresql://neondb_owner:npg_31wxgBiyXEep@ep-wispy-shadow-adq6f1rb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    print("Connecting to SQLite...")
    sqlite_engine = create_engine(sqlite_url)
    
    from app import create_app, db
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = pg_url
    
    print("Connecting to Postgres and creating schema...")
    with app.app_context():
        pg_engine = create_engine(pg_url)
        # We can drop all tables first to ensure clean state
        db.metadata.drop_all(bind=pg_engine)
        db.metadata.create_all(bind=pg_engine)
        print("Schema recreated in Postgres.")

    # Now we read from SQLite and write to Postgres
    meta_sqlite = MetaData()
    meta_sqlite.reflect(bind=sqlite_engine)
    
    # We must insert in topological order so foreign keys don't fail!
    # meta_sqlite.sorted_tables gives us tables in order of their dependencies
    
    with pg_engine.begin() as pg_conn:
        for table in meta_sqlite.sorted_tables:
            if table.name in ('sqlite_sequence', 'alembic_version'):
                continue
                
            print(f"Migrating data for table: {table.name}")
            with sqlite_engine.connect() as sqlite_conn:
                rows = sqlite_conn.execute(table.select()).fetchall()
                if rows:
                    dicts = [dict(r._mapping) for r in rows]
                    
                    target_meta = MetaData()
                    target_meta.reflect(bind=pg_engine, only=[table.name])
                    target_table = target_meta.tables.get(table.name)
                    
                    if target_table is not None:
                        try:
                            # We don't need to delete since we just drop_all
                            pg_conn.execute(target_table.insert(), dicts)
                        except Exception as e:
                            print(f"Error inserting into {table.name}: {e}")
                    else:
                        print(f"Target table {table.name} not found in Postgres.")
                        
    print("Migration completed.")

if __name__ == '__main__':
    migrate()
