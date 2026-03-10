from app import create_app
from app.extensions import db
from datetime import datetime, date
import json

app = create_app()

def serialize(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj

with app.app_context():
    models = []
    for mapper in db.Model.registry.mappers:
        models.append(mapper.class_)
    
    data = {}
    for model in models:
        table_name = model.__tablename__
        records = model.query.all()
        data[table_name] = []
        for r in records:
            d = {}
            for col in r.__table__.columns:
                val = getattr(r, col.name)
                d[col.name] = serialize(val)
            data[table_name].append(d)
            
    # Association table room_amenities
    room_amenities = []
    from app.models.room import room_amenities as ra_table
    for ra in db.session.execute(ra_table.select()):
        room_amenities.append({
            'room_id': ra.room_id,
            'amenity_id': ra.amenity_id
        })
    data['room_amenities'] = room_amenities
    
    with open('local_db_dump.json', 'w') as f:
        json.dump(data, f, indent=4)
        
    print(f"Exported data for tables: {list(data.keys())}")
