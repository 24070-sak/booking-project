from app.extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """
    Table des utilisateurs
    Stocke les informations des clients et administrateurs
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=True) # password can be null for social login
    google_id = db.Column(db.String(256), unique=True, nullable=True)
    facebook_id = db.Column(db.String(256), unique=True, nullable=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    username = db.Column(db.String(100), unique=True, nullable=False)
    access_dashboard = db.Column(db.Boolean, default=True)
    access_control_center = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), default='client')  # 'client', 'admin', 'manager'
    is_active = db.Column(db.Boolean, default=True)
    profile_picture = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Email verification
    is_email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True) # Changed from verification_otp
    token_expires_at = db.Column(db.DateTime, nullable=True)     # Changed from otp_expires_at

    # Password reset
    reset_token = db.Column(db.String(100), nullable=True)       # Changed from reset_otp
    reset_token_expires_at = db.Column(db.DateTime, nullable=True) # Changed from reset_otp_expires_at
    
    # Relations
    bookings = db.relationship('Booking', backref='user', lazy='dynamic')
    reviews = db.relationship('Review', backref='user', lazy='dynamic')
    hotels = db.relationship('Hotel', backref='owner', lazy='dynamic')
    
    def set_password(self, password):
        """Hash le mot de passe"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Vérifie le mot de passe"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convertit l'utilisateur en dictionnaire"""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'username': self.username,
            'profile_picture': self.profile_picture,
            'access_dashboard': self.access_dashboard,
            'access_control_center': self.access_control_center,
            'role': self.role,
            'is_active': self.is_active,
            'is_email_verified': self.is_email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<User {self.email}>'
