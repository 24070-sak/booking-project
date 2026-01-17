from app import create_app, db
from app.models.message import Message
from app.models.user import User
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Seeding Messages...")
    
    admin = User.query.filter_by(role='admin').first()
    client = User.query.filter_by(role='client').first()
    
    if not admin or not client:
        print("Admin or Client user not found. Please run main seeding first.")
        exit()
        
    messages_data = [
        (client.id, admin.id, "Question sur ma réservation", "Bonjour, j'aimerais savoir si le petit déjeuner est inclus."),
        (admin.id, client.id, "Re: Question sur ma réservation", "Bonjour, oui le petit déjeuner continental est inclus dans votre offre."),
        (client.id, None, "Problème technique", "Je n'arrive pas à modifier mes dates de séjour sur le site.")
    ]
    
    for sender_id, receiver_id, subject, content in messages_data:
        msg = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            subject=subject,
            content=content,
            created_at=datetime.utcnow() - timedelta(hours=len(messages_data))
        )
        db.session.add(msg)
        
    db.session.commit()
    print("Messages seeded successfully!")
