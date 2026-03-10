import sys
import json
from datetime import datetime, date

from app import create_app
from app.extensions import db

def parse_isoformat(val):
    if isinstance(val, str):
        try:
            if len(val) == 10 and val.count('-') == 2:
                return datetime.strptime(val, "%Y-%m-%d").date()
            return datetime.fromisoformat(val)
        except ValueError:
            pass
    return val

def import_data():
    app = create_app()
    with app.app_context():
        print("🧹 Nettoyage de la base de données distante...")
        db.drop_all()
        db.create_all()

        print("📦 Chargement des données à importer...")
        with open('local_db_dump.json', 'r') as f:
            data = json.load(f)

        models_map = {}
        for mapper in db.Model.registry.mappers:
            models_map[mapper.class_.__tablename__] = mapper.class_

        ordered_tables = [
            'users', 'notification_settings', 'amenities', 'room_types', 'hotels',
            'rooms', 'room_images', 'bookings', 'payments', 'reviews',
            'messages', 'notifications'
        ]
        
        for table in ordered_tables:
            if table in models_map and table in data:
                model_cls = models_map[table]
                print(f"📥 Importation de {len(data[table])} lignes dans la table '{table}'...")
                for row_data in data[table]:
                    converted_data = {k: parse_isoformat(v) for k, v in row_data.items()}
                    obj = model_cls(**converted_data)
                    db.session.add(obj)
                db.session.commit()

        print(f"📥 Importation de {len(data.get('room_amenities', []))} lignes dans la table 'room_amenities'...")
        from app.models.room import room_amenities as ra_table
        for ra in data.get('room_amenities', []):
            db.session.execute(ra_table.insert().values(room_id=ra['room_id'], amenity_id=ra['amenity_id']))
        db.session.commit()

        if 'postgresql' in db.engine.name:
            print("🔄 Synchronisation des IDs pour la base de données PostgreSQL...")
            for table in ordered_tables:
                if table in models_map and table in data:
                    model_cls = models_map[table]
                    pk_cols = [c.name for c in model_cls.__table__.primary_key.columns]
                    if 'id' in pk_cols:
                        max_id = db.session.query(db.func.max(getattr(model_cls, 'id'))).scalar()
                        if max_id:
                            seq_name = f"{table}_id_seq"
                            try:
                                db.session.execute(db.text(f"SELECT setval('{seq_name}', {max_id});"))
                                db.session.commit()
                            except Exception as e:
                                db.session.rollback()
                                print(f"Impossible de synchroniser l'ID pour {table}: {e}")

        print("✨ Importation terminée avec succès ! La base Render a été mise à jour.")

if __name__ == '__main__':
    import_data()
