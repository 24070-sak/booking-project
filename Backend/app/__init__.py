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
    from app.routes import auth_bp, room_bp, booking_bp
    from app.routes.hotel_routes import hotel_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.review_routes import review_bp
    from app.routes.message_routes import message_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(room_bp)
    app.register_blueprint(hotel_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(message_bp)
    
    # Route de santé
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'API is running'}
    
    return app
