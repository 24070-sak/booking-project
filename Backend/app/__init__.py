from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, bcrypt, jwt
from app.config import config

def create_app(config_name='development'):
    """Factory pour créer l'application Flask"""
    app = Flask(__name__)
    
    # Chargement de la configuration
    app.config.from_object(config[config_name])
    
    # Activer CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialisation des extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Import des modèles
    from app.models import User, Room, RoomType, Amenity, RoomImage, Booking, Payment, Review
    from app.models.hotel import Hotel
    
    # Enregistrement des blueprints (routes)
    from app.routes import auth_bp, room_bp, booking_bp, hotel_routes
    app.register_blueprint(auth_bp)
    app.register_blueprint(room_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(hotel_routes.hotel_bp)
    
    # Route de santé
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'API is running'}
    
    return app
