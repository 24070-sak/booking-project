import os
from app import create_app
from app.extensions import db
from sqlalchemy import inspect, text

app = create_app()

def sync_schema():
    with app.app_context():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        # Get all models
        models = db.Model.registry.mappers
        
        for mapper in models:
            model_class = mapper.class_
            table_name = model_class.__tablename__
            
            if table_name in tables:
                print(f"Checking table: {table_name}")
                existing_columns = [col['name'] for col in inspector.get_columns(table_name)]
                
                for column in mapper.columns:
                    column_name = column.key
                    if column_name not in existing_columns:
                        print(f"  Adding missing column: {column_name} to {table_name}")
                        
                        # Determine column type for SQL
                        col_type = str(column.type).upper()
                        if "VARCHAR" in col_type:
                            col_sql_type = col_type
                        elif "INTEGER" in col_type:
                            col_sql_type = "INT"
                        elif "BOOLEAN" in col_type:
                            col_sql_type = "TINYINT(1)"
                        elif "DATETIME" in col_type:
                            col_sql_type = "DATETIME"
                        elif "TEXT" in col_type:
                            col_sql_type = "TEXT"
                        elif "FLOAT" in col_type:
                            col_sql_type = "FLOAT"
                        else:
                            col_sql_type = "TEXT" # Default fallback
                            
                        nullable = "NULL" if column.nullable else "NOT NULL"
                        default = ""
                        if column.default:
                             # Simplified default handling
                             pass
                             
                        try:
                            # Use ALTER TABLE to add the column
                            alter_query = text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {col_sql_type} {nullable}")
                            db.session.execute(alter_query)
                            db.session.commit()
                            print(f"    Successfully added {column_name}")
                        except Exception as e:
                            print(f"    Error adding {column_name}: {e}")
                            db.session.rollback()
            else:
                print(f"Table {table_name} does not exist, creating it...")
                # Note: create_all will create missing tables but not missing columns in existing tables
                pass
        
        # Finally run create_all for any missing tables
        db.create_all()
        print("Schema synchronization complete.")

if __name__ == "__main__":
    sync_schema()
