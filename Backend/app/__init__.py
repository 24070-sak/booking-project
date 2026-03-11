from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, bcrypt, jwt, oauth, mail
from app.config import config

def create_app(config_name='development'):
    """Factory pour créer l'application Flask"""
    app = Flask(__name__)
    
    # Chargement de la configuration
    app.config.from_object(config[config_name])
    
    # Activer CORS – supports_credentials=True needed for JWT auth headers
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    @app.after_request
    def add_cors_headers(response):
        """Garantir les headers CORS sur TOUTES les réponses, y compris les erreurs 5xx."""
        response.headers.setdefault("Access-Control-Allow-Origin", "*")
        response.headers.setdefault("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.setdefault("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        return response
    
    # Initialisation des extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    oauth.init_app(app)
    mail.init_app(app)
    
    # Configuration OAuth Providers
    oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )
    
    oauth.register(
        name='facebook',
        client_id=app.config['FACEBOOK_CLIENT_ID'],
        client_secret=app.config['FACEBOOK_CLIENT_SECRET'],
        access_token_url='https://graph.facebook.com/oauth/access_token',
        access_token_params=None,
        authorize_url='https://www.facebook.com/dialog/oauth',
        authorize_params=None,
        api_base_url='https://graph.facebook.com/',
        client_kwargs={'scope': 'email public_profile'}
    )
    
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
    from app.routes.notification_routes import notification_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(room_bp)
    app.register_blueprint(hotel_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(message_bp)
    app.register_blueprint(notification_bp)
    
    # Route de santé
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'API is running'}
    
    return app
