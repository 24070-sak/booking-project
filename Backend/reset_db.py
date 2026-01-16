from app import create_app
from app.extensions import db

def reset_db():
    app = create_app()
    with app.app_context():
        # Désactiver les vérifications de clé étrangère pour tout supprimer proprement
        db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 0'))
        
        # Récupérer toutes les tables
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        for table in tables:
            print(f"🗑️ Suppression de la table : {table}")
            db.session.execute(db.text(f'DROP TABLE IF EXISTS {table}'))
            
        db.session.execute(db.text('SET FOREIGN_KEY_CHECKS = 1'))
        db.session.commit()
        print("✨ Base de données nettoyée avec succès.")

if __name__ == '__main__':
    reset_db()
