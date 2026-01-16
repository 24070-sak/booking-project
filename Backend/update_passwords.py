from app import create_app
from app.extensions import db
from app.models.user import User

def update_passwords():
    app = create_app()
    with app.app_context():
        # Dictionnaire des mots de passe par email
        passwords = {
            'admin@hotel.com': 'admin123',
            'manager@hotel.com': 'manager123',
            'jean.martin@email.com': 'password123',
            'sophie.bernard@email.com': 'password123',
            'pierre.durand@email.com': 'password123'
        }
        
        print("🔄 Mise à jour des mots de passe...")
        
        for email, password in passwords.items():
            user = User.query.filter_by(email=email).first()
            if user:
                user.set_password(password)
                print(f"✅ Mot de passe mis à jour pour {email}")
            else:
                print(f"⚠️ Utilisateur non trouvé : {email}")
        
        db.session.commit()
        print("\n✨ Terminé ! Vous pouvez maintenant vous connecter.")

if __name__ == '__main__':
    update_passwords()
