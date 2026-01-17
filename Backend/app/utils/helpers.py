import subprocess
import os
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User

def admin_required():
    """Décorateur pour restreindre l'accès aux administrateurs"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or user.role != 'admin':
                return jsonify({'error': 'Accès refusé. Administrateur requis.'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def update_db_dump():
    """Met à jour le fichier booking_database.sql avec les données actuelles"""
    try:
        # Déterminer le chemin absolu du fichier SQL
        # On remonte de app/utils à la racine Backend/database/
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
        dump_path = os.path.join(base_dir, "Backend/database/booking_database.sql")
        
        # Commande mysqldump (identique à celle utilisée manuellement)
        cmd = [
            "mysqldump",
            "-h", "127.0.0.1",
            "-u", "root",
            "--no-create-db",
            "--skip-comments",
            "--skip-set-charset",
            "booking_system"
        ]
        
        # Exécuter la commande
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            # Traitement de la sortie pour garder un format propre
            lines = result.stdout.splitlines()
            # Supprimer les lignes techniques de MySQL et les lignes vides
            cleaned_lines = [line for line in lines if not line.startswith("/*!") and not line.startswith("--") and line.strip()]
            
            # En-tête personnalisé
            header = [
                "-- ============================================================",
                "-- BASE DE DONNÉES BOOKING - STRUCTURE ET DONNÉES (AUTO-SYNC)",
                "-- ============================================================",
                "",
                "CREATE DATABASE IF NOT EXISTS booking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
                "USE booking_system;",
                "",
                "SET FOREIGN_KEY_CHECKS = 0;",
                ""
            ]
            
            # Réécriture du fichier
            with open(dump_path, "w", encoding='utf-8') as f:
                f.write("\n".join(header) + "\n")
                f.write("\n".join(cleaned_lines) + "\n")
                f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")
            
            print(f"✅ SQL Dump synchronisé : {dump_path}")
            return True
        else:
            print(f"❌ Erreur mysqldump : {result.stderr}")
    except Exception as e:
        print(f"❌ Erreur lors de la synchro SQL : {e}")
    return False
