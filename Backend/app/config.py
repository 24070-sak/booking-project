import os
from datetime import timedelta
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Config:
    """Configuration de base pour l'application"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Configuration MySQL
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'abass')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '12345678')
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'booking_system')
    
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    AIVEN_PASSWORD = os.environ.get('AIVEN_PASSWORD', '')
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://avnadmin:{AIVEN_PASSWORD}@mysql-1814249b-supnum-1298.b.aivencloud.com:23295/defaultdb" if AIVEN_PASSWORD else "postgresql://dummy"
    
    # print(f"DEBUG: SQLALCHEMY_DATABASE_URI = {SQLALCHEMY_DATABASE_URI}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'connect_args': {'ssl': ctx}
    }
    
    # Configuration JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Configuration OAuth
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    FACEBOOK_CLIENT_ID = os.environ.get('FACEBOOK_CLIENT_ID')
    FACEBOOK_CLIENT_SECRET = os.environ.get('FACEBOOK_CLIENT_SECRET')

    # Flask-Mail (for OTP / email verification)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@stayin.mr')


class DevelopmentConfig(Config):
    """Configuration pour le développement"""
    DEBUG = True
    # MYSQL_DATABASE = 'booking_system'
    SQLALCHEMY_DATABASE_URI = Config.SQLALCHEMY_DATABASE_URI


class ProductionConfig(Config):
    """Configuration pour la production"""
    DEBUG = False


class TestingConfig(Config):
    """Configuration pour les tests"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}:{Config.MYSQL_PORT}/booking_test'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
