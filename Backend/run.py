import os
from app import create_app, db
from flask_cors import CORS

# 1. Initialisation de l'application
app = create_app()

# 2. Activation des CORS (pour autoriser ton Frontend Vercel)
CORS(app)

# 3. Création automatique des tables dans TiDB au démarrage
with app.app_context():
    try:
        db.create_all()
        print("✅ Base de données initialisée avec succès !")
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation : {e}")

# 4. Route d'accueil pour tester si l'API fonctionne
@app.route("/")
def home():
    return {
        "message": "Bienvenue sur l'API Hotel Booking",
        "status": "Online",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "rooms": "/api/rooms",
            "bookings": "/api/bookings",
            "health": "/api/health"
        }
    }

# 5. Lancement (utilisé par Render via Gunicorn)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)