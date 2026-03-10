from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
import certifi
import sys
import os
import ssl

def migrate():
    # Set up the paths
    backend_dir = '/home/sak/Desktop/booking-project/Backend'
    sys.path.append(backend_dir)
    os.chdir(backend_dir)
    
    sqlite_url = "sqlite:////home/sak/Desktop/booking-project/Backend/booking.db"
    mysql_url = "mysql+pymysql://avnadmin:REPLACE_ME@mysql-1814249b-supnum-1298.b.aivencloud.com:23295/defaultdb"
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Connecting to SQLite...")
    sqlite_engine = create_engine(sqlite_url)
    
    from app import create_app, db
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = mysql_url
    
    print("Connecting to MySQL and creating schema...")
    with app.app_context():
        # Override the engine bind for the session
        mysql_engine = create_engine(mysql_url, connect_args={'ssl': ctx})
        db.metadata.create_all(bind=mysql_engine)
        print("Schema created in MySQL.")

    # Now we read from SQLite and write to MySQL
    meta_sqlite = MetaData()
    meta_sqlite.reflect(bind=sqlite_engine)
    
    from sqlalchemy.sql import text
    with mysql_engine.connect() as mysql_conn:
        mysql_conn.execute(text('SET FOREIGN_KEY_CHECKS=0;'))
        
        for table in meta_sqlite.tables.values():
            if table.name in ('sqlite_sequence', 'alembic_version'):
                continue
                
            print(f"Migrating data for table: {table.name}")
            with sqlite_engine.connect() as sqlite_conn:
                rows = sqlite_conn.execute(table.select()).fetchall()
                if rows:
                    dicts = [dict(r._mapping) for r in rows]
                    
                    target_meta = MetaData()
                    target_meta.reflect(bind=mysql_engine, only=[table.name])
                    target_table = target_meta.tables.get(table.name)
                    
                    if target_table is not None:
                        mysql_conn.execute(target_table.delete())
                        try:
                            mysql_conn.execute(target_table.insert(), dicts)
                        except Exception as e:
                            print(f"Error inserting into {table.name}: {e}")
                    else:
                        print(f"Target table {table.name} not found in MySQL.")
        
        mysql_conn.execute(text('SET FOREIGN_KEY_CHECKS=1;'))
        mysql_conn.commit()
    print("Migration completed.")

if __name__ == '__main__':
    migrate()
