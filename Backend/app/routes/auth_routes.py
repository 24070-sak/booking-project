from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.extensions import db, oauth
from app.models.user import User
from app.utils.helpers import update_db_dump
from werkzeug.utils import secure_filename
import random
import os
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# ... (دالة update_profile و register تبقى كما هي بدون تغيير) ...

@auth_bp.route('/firebase-register', methods=['POST'])
def firebase_register():
    """تسجيل مستخدم جديد قادم من Firebase وحفظه في MySQL"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('firebase_uid'):
        return jsonify({'error': 'Données Firebase invalides'}), 400
        
    # التحقق من وجود المستخدم
    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({'error': 'Cet utilisateur existe déjà'}), 400
        
    # توليد اسم المستخدم (إجباري في قاعدتك)
    first_name = data.get('first_name') or data.get('email').split('@')[0]
    base_username = first_name.lower()
    username = base_username
    if User.query.filter_by(username=username).first():
        random_suffix = random.randint(1000, 9999)
        username = f"{base_username}-{random_suffix}"
        
    # إنشاء المستخدم مع ربط الـ Firebase UID بحقل google_id
    user = User(
        email=data['email'],
        google_id=data['firebase_uid'], # تخزين المعرف هنا للحفاظ على هيكل القاعدة
        first_name=first_name,
        last_name=data.get('last_name', ''),
        phone=data.get('phone', ''),
        username=username,
        access_dashboard=False,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        update_db_dump()
        
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Inscription Firebase réussie',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur database: {str(e)}'}), 500

@auth_bp.route('/firebase-login', methods=['POST'])
def firebase_login():
    """تسجيل الدخول أو الإنشاء التلقائي لمستخدمي Firebase"""
    data = request.get_json()
    email = data.get('email')
    firebase_uid = data.get('firebase_uid')
    
    if not email or not firebase_uid:
        return jsonify({'error': 'Email et UID requis'}), 400
        
    # البحث عن المستخدم بالإيميل أو الـ google_id (الذي خزنّا فيه UID)
    user = User.query.filter((User.email == email) | (User.google_id == firebase_uid)).first()
    
    if not user:
        # إنشاء تلقائي إذا كان أول دخول له عبر Firebase
        first_name = data.get('first_name') or email.split('@')[0]
        base_username = first_name.lower()
        username = base_username
        if User.query.filter_by(username=username).first():
            username = f"{base_username}-{random.randint(1000, 9999)}"
            
        user = User(
            email=email,
            google_id=firebase_uid,
            first_name=first_name,
            last_name=data.get('last_name', ''),
            username=username,
            is_active=True,
            access_dashboard=False
        )
        db.session.add(user)
        db.session.commit()
        update_db_dump()
    
    # تحديث الـ google_id إذا لم يكن موجوداً (للمستخدمين القدامى)
    elif not user.google_id:
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

# ... (بقية ملفك من login و social_callback تبقى كما هي) ...