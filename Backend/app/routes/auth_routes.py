from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.extensions import db, oauth
from app.models.user import User
from app.utils.helpers import update_db_dump
from werkzeug.utils import secure_filename
import random
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# ... (Previous code)

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Mettre à jour le profil utilisateur (incluant photo)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    # Check if multipart/form-data
    is_multipart = request.content_type and request.content_type.startswith('multipart/form-data')
    
    data = None
    if is_multipart:
        data = request.form
        
        # Handle Profile Picture
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename != '':
                filename = secure_filename(f"user_{user.id}_{file.filename}")
                upload_folder = os.path.join(current_app.root_path, 'static/uploads/profiles')
                os.makedirs(upload_folder, exist_ok=True)
                file.save(os.path.join(upload_folder, filename))
                
                # Update User
                # Assuming backend URL is handled by frontend or proxy, return relative path
                # Note: Flask serves 'static' at /static by default
                user.profile_picture = f"http://localhost:5000/static/uploads/profiles/{filename}" 
                # Ideally, use an environment variable for base URL, but for now hardcode dev URL is easiest for user
    else:
        data = request.get_json() or {}
    
    if data:
        if data.get('first_name'):
            user.first_name = data['first_name']
        if data.get('last_name'):
            user.last_name = data['last_name']
        if data.get('phone'):
            user.phone = data['phone']
    
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
    return jsonify({
        'message': 'Profil mis à jour',
        'user': user.to_dict()
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    data = request.get_json()
    
    # Validation
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400
    
    # Vérifier si l'email existe déjà
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400
    
    first_name = data['first_name']
    
    # Génération du username
    base_username = first_name.lower()
    username = base_username
    
    # Vérifier unicité et ajouter suffixe si nécessaire
    if User.query.filter_by(username=username).first():
        random_suffix = random.randint(100000, 999999)
        username = f"{base_username}-{random_suffix}"
    
    # Créer l'utilisateur
    user = User(
        email=data['email'],
        first_name=first_name,
        last_name=data['last_name'],
        phone=data.get('phone'),
        username=username,
        access_dashboard=False, # Désactivé par défaut pour les utilisateurs normaux
        access_control_center=False # Par défaut, pas d'accès au control center
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Synchroniser le fichier SQL
    update_db_dump()
    
    # Générer les tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Inscription réussie',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Connexion utilisateur"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email et mot de passe requis'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
    
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


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtenir le profil de l'utilisateur connecté"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Rafraîchir le token d'accès"""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))
    
    return jsonify({'access_token': access_token}), 200





# Routes OAuth

@auth_bp.route('/<provider>')
def social_login(provider):
    """Redirection vers le fournisseur OAuth"""
    if provider not in ['google', 'facebook']:
        return jsonify({'error': 'Fournisseur non supporté'}), 400
        
    client = oauth.create_client(provider)
    redirect_uri = url_for('auth.social_callback', provider=provider, _external=True)
    return client.authorize_redirect(redirect_uri)


@auth_bp.route('/<provider>/callback')
def social_callback(provider):
    """Callback après authentification OAuth"""
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
        
    # Vérifier si l'utilisateur existe
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Génération du username
        base_username = first_name.lower() or 'user'
        username = base_username
        if User.query.filter_by(username=username).first():
            random_suffix = random.randint(100000, 999999)
            username = f"{base_username}-{random_suffix}"

        # Créer un nouvel utilisateur
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash=None, # Pas de mot de passe pour social login
            is_active=True,
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
        # Mettre à jour les IDs sociaux si nécessaire
        if provider == 'google' and not user.google_id:
            user.google_id = social_id
            db.session.commit()
        elif provider == 'facebook' and not user.facebook_id:
            user.facebook_id = social_id
            db.session.commit()
            
    # Générer les tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    # Rediriger vers le frontend avec le token
    # Note: En production, éviter de passer le token dans l'URL. 
    # Utiliser un cookie sécurisé ou une page intermédiaire qui poste le token.
    # Pour ce projet, on passe en query param pour simplicité.
    frontend_url = 'http://localhost:5173/social-callback'
    return redirect(f'{frontend_url}?token={access_token}&user_id={user.id}&email={user.email}&first_name={user.first_name}&last_name={user.last_name}&username={user.username}&role={user.role}&access_dashboard={str(user.access_dashboard).lower()}&access_control_center={str(user.access_control_center).lower()}')
@auth_bp.route('/admin/create-user', methods=['POST'])
@jwt_required()
def admin_create_user():
    """Création d'un utilisateur par un administrateur ayant la haute-permission"""
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or not admin.access_control_center:
        return jsonify({'error': 'Accès interdit. Haute permission requise.'}), 403
        
    data = request.get_json()
    
    # Validation
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400
            
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400
        
    # Génération du username
    first_name = data['first_name']
    base_username = first_name.lower()
    username = base_username
    if User.query.filter_by(username=username).first():
        random_suffix = random.randint(100000, 999999)
        username = f"{base_username}-{random_suffix}"
        
    # Créer l'utilisateur
    new_user = User(
        email=data['email'],
        first_name=first_name,
        last_name=data['last_name'],
        phone=data.get('phone'),
        username=username,
        access_dashboard=True,
        access_control_center=data.get('access_control_center', False)
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    update_db_dump()
    
    return jsonify({
        'message': 'Utilisateur créé avec succès',
        'user': new_user.to_dict()
    }), 201
