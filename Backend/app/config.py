import os
from datetime import timedelta
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Config:
    """Configuration de base pour l'application"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # ── Database ────────────────────────────────────────────────────────────
    # Priority:  DATABASE_URL env var  →  SQLite fallback (offline/local)
    _database_url = os.environ.get('DATABASE_URL')

    if _database_url and _database_url.startswith('sqlite'):
        # SQLite — simple local file, no network required
        SQLALCHEMY_DATABASE_URI = _database_url
        SQLALCHEMY_ENGINE_OPTIONS = {}           # no SSL / pooling options for SQLite
    elif _database_url:
        # Any other explicit URL (mysql, postgres…)
        import ssl as _ssl
        _ctx = _ssl.create_default_context()
        _ctx.check_hostname = False
        _ctx.verify_mode = _ssl.CERT_NONE
        SQLALCHEMY_DATABASE_URI = _database_url
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_recycle': 3600,
            'pool_pre_ping': True,
        }
    else:
        # Legacy hard-coded PostgreSQL (Neon) — kept as last resort
        import ssl as _ssl
        _ctx = _ssl.create_default_context()
        _ctx.check_hostname = False
        _ctx.verify_mode = _ssl.CERT_NONE
        SQLALCHEMY_DATABASE_URI = (
            "postgresql+pg8000://neondb_owner:npg_31wxgBi"
            "yXEep@ep-wispy-shadow-adq6f1rb-pooler.c-2.us-east-1.aws.neon.tech/neondb"
        )
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_recycle': 3600,
            'pool_pre_ping': True,
            'connect_args': {'ssl_context': _ctx},
        }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── JWT ──────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # ── OAuth (optional — social login disabled when these are empty) ────────
    GOOGLE_CLIENT_ID     = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    FACEBOOK_CLIENT_ID     = os.environ.get('FACEBOOK_CLIENT_ID')
    FACEBOOK_CLIENT_SECRET = os.environ.get('FACEBOOK_CLIENT_SECRET')

    # ── Flask-Mail (optional — prints to console when not configured) ────────
    MAIL_SERVER         = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT           = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS        = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME       = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD       = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@stayin.local')


class DevelopmentConfig(Config):
    """Configuration pour le développement"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = Config.SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_ENGINE_OPTIONS = Config.SQLALCHEMY_ENGINE_OPTIONS


class ProductionConfig(Config):
    """Configuration pour la production"""
    DEBUG = False


class TestingConfig(Config):
    """Configuration pour les tests"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ENGINE_OPTIONS = {}


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
