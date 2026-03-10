from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.extensions import db, oauth
from app.models.user import User
from app.utils.helpers import update_db_dump
from app.utils.email_sender import send_verification_email, send_password_reset_email
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import random
import os
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

import secrets

def generate_token():
    """Génère un code OTP à 6 chiffres"""
    import random
    return f"{random.randint(100000, 999999)}"


def validate_password_strength(password):
    """
    Medium-to-strong password:
    - Min 8 characters
    - At least 1 uppercase letter
    - At least 1 digit
    - At least 1 special character
    """
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères."
    if not re.search(r'[A-Z]', password):
        return False, "Le mot de passe doit contenir au moins une lettre majuscule."
    if not re.search(r'\d', password):
        return False, "Le mot de passe doit contenir au moins un chiffre."
    if not re.search(r'[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/]', password):
        return False, "Le mot de passe doit contenir au moins un caractère spécial."
    return True, "OK"


# ─────────────────────────────────────────────────────────────────────────────
# Firebase Register — Called by frontend after Firebase creates the account
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/firebase-register', methods=['POST'])
def firebase_register():
    """Enregistrer un utilisateur Firebase dans MySQL"""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('firebase_uid'):
        return jsonify({'error': 'Données Firebase invalides'}), 400

    # Check if user already exists
    user = User.query.filter_by(email=data['email']).first()
    if user:
        # If already exists just return tokens (idempotent)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify({
            'message': 'Utilisateur déjà existant',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    # Generate username
    first_name = data.get('first_name') or data.get('name', '').split(' ')[0] or data['email'].split('@')[0]
    last_name = data.get('last_name') or ' '.join(data.get('name', '').split(' ')[1:]) or ''
    base_username = first_name.lower()
    username = base_username
    if User.query.filter_by(username=username).first():
        username = f"{base_username}-{random.randint(1000, 9999)}"

    token = generate_token()
    token_expiry = datetime.utcnow() + timedelta(minutes=15)

    user = User(
        email=data['email'],
        google_id=data['firebase_uid'],
        first_name=first_name,
        last_name=last_name,
        phone=data.get('phone', ''),
        username=username,
        access_dashboard=False,
        is_active=True,
        is_email_verified=False,
        verification_token=token,
        token_expires_at=token_expiry,
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(user)
        db.session.commit()
        update_db_dump()

        # Envoi de l'email de vérification
        send_verification_email(
            to_email=data['email'],
            code=token
        )

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify({
            'message': 'Inscription réussie. Veuillez vérifier votre email.',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'email_verification_required': True
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur database: {str(e)}'}), 500


# ─────────────────────────────────────────────────────────────────────────────
# Firebase Login — Called after every Firebase sign-in (email/password or social)
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/firebase-login', methods=['POST'])
def firebase_login():
    """Connexion / création automatique pour les utilisateurs Firebase"""
    data = request.get_json()
    email = data.get('email')
    firebase_uid = data.get('firebase_uid')

    if not email or not firebase_uid:
        return jsonify({'error': 'Email et UID requis'}), 400

    # Search by email OR google_id (where we store firebase UID)
    user = User.query.filter(
        (User.email == email) | (User.google_id == firebase_uid)
    ).first()

    if not user:
        # Auto-create on first Firebase login
        first_name = data.get('first_name') or data.get('name', '').split(' ')[0] or email.split('@')[0]
        last_name = data.get('last_name') or ' '.join(data.get('name', '').split(' ')[1:]) or ''
        base_username = first_name.lower()
        username = base_username
        if User.query.filter_by(username=username).first():
            username = f"{base_username}-{random.randint(1000, 9999)}"

        user = User(
            email=email,
            google_id=firebase_uid,
            first_name=first_name,
            last_name=last_name,
            username=username,
            is_active=True,
            is_email_verified=True,
            access_dashboard=False
        )

        # Store profile picture if provided (from Google)
        if data.get('profile_picture'):
            user.profile_picture = data['profile_picture']

        db.session.add(user)
        db.session.commit()
        update_db_dump()
    else:
        # Update google_id if missing (for existing users)
        if not user.google_id:
            user.google_id = firebase_uid
            db.session.commit()

    if not user.is_active:
        return jsonify({'error': 'Compte désactivé'}), 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Connexion réussie',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# Google Authentication — Dedicated endpoint for Firebase Google sign-in
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """
    Authentification Google via Firebase.
    Reçoit le UID Firebase, email et displayName après signInWithPopup.
    
    Logique :
    1. Cherche un utilisateur par google_id (Firebase UID)
    2. Si non trouvé, cherche par email et lie le google_id
    3. Si complètement nouveau, crée un nouvel utilisateur
    """
    data = request.get_json()

    google_id = data.get('google_id') or data.get('firebase_uid')
    email = data.get('email', '').strip()
    display_name = data.get('displayName', '')
    profile_picture = data.get('profile_picture')

    if not google_id or not email:
        return jsonify({'error': 'google_id et email sont requis'}), 400

    # Parse display name into first/last
    name_parts = display_name.split(' ', 1) if display_name else [email.split('@')[0]]
    first_name = data.get('first_name') or name_parts[0] or email.split('@')[0]
    last_name = data.get('last_name') or (name_parts[1] if len(name_parts) > 1 else '')

    user = None

    # ── Étape 1 : Chercher par google_id ──────────────────────────────────
    user = User.query.filter_by(google_id=google_id).first()

    if not user:
        # ── Étape 2 : Chercher par email (lier le compte) ─────────────────
        user = User.query.filter_by(email=email).first()

        if user:
            # Lier le google_id au compte existant
            user.google_id = google_id
            if not user.is_email_verified:
                user.is_email_verified = True  # Google vérifie l'email
            if profile_picture and not user.profile_picture:
                user.profile_picture = profile_picture
            db.session.commit()
        else:
            # ── Étape 3 : Créer un nouvel utilisateur ─────────────────────
            base_username = first_name.lower()
            username = base_username
            if User.query.filter_by(username=username).first():
                username = f"{base_username}-{random.randint(1000, 9999)}"

            user = User(
                email=email,
                google_id=google_id,
                first_name=first_name,
                last_name=last_name,
                username=username,
                is_active=True,
                is_email_verified=True,  # Google vérifie l'email
                access_dashboard=False,
                profile_picture=profile_picture
            )
            db.session.add(user)
            db.session.commit()
            update_db_dump()

    # ── Vérifier que le compte est actif ──────────────────────────────────
    if not user.is_active:
        return jsonify({'error': 'Compte désactivé'}), 403

    # ── Générer les tokens JWT ────────────────────────────────────────────
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Connexion Google réussie',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# Register (classic — kept for admin or manual use)
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    """Inscription classique + envoi OTP de vérification email"""
    data = request.get_json()

    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400

    # Password strength
    is_strong, msg = validate_password_strength(data['password'])
    if not is_strong:
        return jsonify({'error': msg}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400

    first_name = data['first_name']
    base_username = first_name.lower()
    username = base_username
    if User.query.filter_by(username=username).first():
        username = f"{base_username}-{random.randint(100000, 999999)}"

    token = generate_token()
    token_expiry = datetime.utcnow() + timedelta(minutes=15)

    user = User(
        email=data['email'],
        first_name=first_name,
        last_name=data['last_name'],
        phone=data.get('phone'),
        username=username,
        access_dashboard=False,
        access_control_center=False,
        is_email_verified=False,
        verification_token=token,
        token_expires_at=token_expiry
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()
    update_db_dump()

    # Send verification email
    send_verification_email(
        to_email=data['email'],
        code=token
    )

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Inscription réussie. Vérifiez votre email.',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'email_verification_required': True
    }), 201


# ─────────────────────────────────────────────────────────────────────────────
# Resend Verification OTP
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/send-verification', methods=['POST'])
def send_verification():
    """Renvoyer le code OTP de vérification d'email"""
    data = request.get_json()
    email = data.get('email', '').strip()

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    if user.is_email_verified:
        return jsonify({'message': 'Email déjà vérifié'}), 200

    token = generate_token()
    user.verification_token = token
    user.token_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.session.commit()

    send_verification_email(
        to_email=email,
        code=token
    )

    return jsonify({'message': 'Lien envoyé'}), 200


# ─────────────────────────────────────────────────────────────────────────────
# Verify Email OTP
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Vérifier l'email avec le token reçu"""
    data = request.get_json()
    email = data.get('email', '').strip()
    token = data.get('token', '').strip()

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    if user.is_email_verified:
        return jsonify({'message': 'Email déjà vérifié'}), 200

    if user.verification_token != token:
        return jsonify({'error': 'Lien invalide ou corrompu'}), 400

    if user.token_expires_at and datetime.utcnow() > user.token_expires_at:
        return jsonify({'error': 'Lien expiré. Veuillez demander un nouveau lien.'}), 400

    user.is_email_verified = True
    user.verification_token = None
    user.token_expires_at = None
    db.session.commit()
    update_db_dump()

    return jsonify({
        'message': 'Email vérifié avec succès',
        'user': user.to_dict()
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# Forgot Password — Send Reset OTP
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Envoyer un code OTP pour réinitialiser le mot de passe"""
    data = request.get_json()
    email = data.get('email', '').strip()

    user = User.query.filter_by(email=email).first()
    # Always return 200 to prevent email enumeration
    if not user:
        return jsonify({'message': "Si l'email existe, un code a été envoyé."}), 200

    token = generate_token()
    user.reset_token = token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.session.commit()

    send_password_reset_email(
        to_email=email,
        code=token
    )

    return jsonify({'message': "Si l'email existe, un lien a été envoyé."}), 200


# ─────────────────────────────────────────────────────────────────────────────
# Reset Password — Verify OTP + Set New Password
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Réinitialiser le mot de passe avec le token"""
    data = request.get_json()
    email = data.get('email', '').strip()
    token = data.get('token', '').strip()
    new_password = data.get('new_password', '')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    if not user.reset_token or user.reset_token != token:
        return jsonify({'error': 'Lien invalide ou corrompu'}), 400

    if user.reset_token_expires_at and datetime.utcnow() > user.reset_token_expires_at:
        return jsonify({'error': 'Lien expiré. Demandez un nouveau lien.'}), 400

    is_strong, msg = validate_password_strength(new_password)
    if not is_strong:
        return jsonify({'error': msg}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.session.commit()
    update_db_dump()

    return jsonify({'message': 'Mot de passe réinitialisé avec succès'}), 200


# ─────────────────────────────────────────────────────────────────────────────
# Login (classic — kept for fallback/testing)
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
def login():
    """Connexion utilisateur classique (sans Firebase)"""
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email et mot de passe requis'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'Email inconnu'}), 401

    if not user.check_password(data['password']):
        return jsonify({'error': 'Mot de passe incorrect'}), 401

    if not user.is_active:
        return jsonify({'error': 'Compte désactivé'}), 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Connexion réussie',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'email_verification_required': False
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Mettre à jour le profil utilisateur (incluant photo)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    is_multipart = request.content_type and request.content_type.startswith('multipart/form-data')

    data = None
    if is_multipart:
        data = request.form
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename != '':
                filename = secure_filename(f"user_{user.id}_{file.filename}")
                upload_folder = os.path.join(current_app.root_path, 'static/uploads/profiles')
                os.makedirs(upload_folder, exist_ok=True)
                file.save(os.path.join(upload_folder, filename))
                user.profile_picture = f"http://localhost:5000/static/uploads/profiles/{filename}"
    else:
        data = request.get_json() or {}

    if data:
        if data.get('first_name'):
            user.first_name = data['first_name']
        if data.get('last_name'):
            user.last_name = data['last_name']
        if data.get('phone'):
            user.phone = data['phone']
        email_val = data.get('email')
        if email_val and (user.role == 'admin' or user.role == 'manager'):
            new_email = str(email_val).strip()
            if new_email and new_email != user.email:
                if User.query.filter_by(email=new_email).first():
                    return jsonify({'error': 'Cet email est déjà utilisé par un autre utilisateur'}), 400
                user.email = new_email

    db.session.commit()
    update_db_dump()

    return jsonify({'message': 'Profil mis à jour', 'user': user.to_dict()}), 200


# ─────────────────────────────────────────────────────────────────────────────
# Me
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))
    return jsonify({'access_token': access_token}), 200


# ─────────────────────────────────────────────────────────────────────────────
# OAuth (legacy — Authlib redirect flow, kept for compatibility)
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/<provider>')
def social_login(provider):
    if provider not in ['google', 'facebook']:
        return jsonify({'error': 'Fournisseur non supporté'}), 400
    client = oauth.create_client(provider)
    redirect_uri = url_for('auth.social_callback', provider=provider, _external=True)
    return client.authorize_redirect(redirect_uri)


@auth_bp.route('/<provider>/callback')
def social_callback(provider):
    if provider not in ['google', 'facebook']:
        return jsonify({'error': 'Fournisseur non supporté'}), 400
    client = oauth.create_client(provider)
    try:
        token = client.authorize_access_token()
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    if provider == 'google':
        user_info = client.parse_id_token(token, nonce=None)
        social_id = user_info['sub']
        email = user_info['email']
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
    elif provider == 'facebook':
        user_info = client.get('me?fields=id,name,email,first_name,last_name').json()
        social_id = user_info['id']
        email = user_info.get('email')
        first_name = user_info.get('first_name', '')
        last_name = user_info.get('last_name', '')

    if not email:
        return jsonify({'error': 'Email non fourni par le fournisseur'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        base_username = first_name.lower() or 'user'
        username = base_username
        if User.query.filter_by(username=username).first():
            username = f"{base_username}-{random.randint(100000, 999999)}"
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash=None,
            is_active=True,
            is_email_verified=True,
            username=username,
            access_dashboard=False,
            access_control_center=False
        )
        if provider == 'google':
            user.google_id = social_id
        else:
            user.facebook_id = social_id
        db.session.add(user)
        db.session.commit()
    else:
        if provider == 'google' and not user.google_id:
            user.google_id = social_id
            db.session.commit()
        elif provider == 'facebook' and not user.facebook_id:
            user.facebook_id = social_id
            db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    frontend_url = 'http://localhost:5173/social-callback'
    return redirect(
        f'{frontend_url}?token={access_token}&user_id={user.id}&email={user.email}'
        f'&first_name={user.first_name}&last_name={user.last_name}&username={user.username}'
        f'&role={user.role}&access_dashboard={str(user.access_dashboard).lower()}'
        f'&access_control_center={str(user.access_control_center).lower()}'
    )


# ─────────────────────────────────────────────────────────────────────────────
# Admin: Create User
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/admin/create-user', methods=['POST'])
@jwt_required()
def admin_create_user():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    if not admin or not admin.access_control_center:
        return jsonify({'error': 'Accès interdit. Haute permission requise.'}), 403

    data = request.get_json()
    required_fields = ['email', 'password', 'first_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400

    first_name = data['first_name']
    base_username = first_name.lower()
    username = base_username
    if User.query.filter_by(username=username).first():
        username = f"{base_username}-{random.randint(100000, 999999)}"

    new_user = User(
        email=data['email'],
        first_name=first_name,
        last_name=data.get('last_name', ''),
        phone=data.get('phone'),
        username=username,
        access_dashboard=True,
        access_control_center=data.get('access_control_center', False),
        role='admin' if data.get('access_control_center', False) else 'manager',
        is_email_verified=True
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    update_db_dump()
    return jsonify({'message': 'Utilisateur créé avec succès', 'user': new_user.to_dict()}), 201

# ─────────────────────────────────────────────────────────────────────────────
# Admin: List, Update, Delete Managers
# ─────────────────────────────────────────────────────────────────────────────

@auth_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    if not admin or not admin.access_control_center:
        return jsonify({'error': 'Accès interdit. Haute permission requise.'}), 403

    users = User.query.filter(User.role.in_(['manager', 'admin'])).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@auth_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def admin_update_user(user_id):
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    if not admin or not admin.access_control_center:
        return jsonify({'error': 'Accès interdit. Haute permission requise.'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    data = request.get_json()

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        new_email = data['email']
        if new_email != user.email and User.query.filter_by(email=new_email).first():
            return jsonify({'error': 'Cet email est déjà pris'}), 400
        user.email = new_email
    if 'phone' in data:
        user.phone = data['phone']
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    db.session.commit()
    update_db_dump()

    return jsonify({'message': 'Utilisateur mis à jour', 'user': user.to_dict()}), 200


@auth_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    if not admin or not admin.access_control_center:
        return jsonify({'error': 'Accès interdit. Haute permission requise.'}), 403

    if str(user_id) == str(current_user_id):
        return jsonify({'error': 'Vous ne pouvez pas supprimer votre propre compte.'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    db.session.delete(user)
    db.session.commit()
    update_db_dump()

    return jsonify({'message': 'Utilisateur supprimé avec succès'}), 200
