from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.booking import Booking
from app.models.payment import Payment

payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@payment_bp.route('', methods=['GET'])
@jwt_required()
def get_payments():
    """Liste les paiements de l'utilisateur actuel"""
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    query = Payment.query.join(Booking)
    
    # Si c'est un administrateur, on pourrait vouloir tout voir, 
    # mais la demande dit "compte courant seulement"
    # Je vais quand même permettre aux admins de tout voir s'ils le souhaitent, 
    # mais je vais filtrer par défaut pour respecter la demande.
    # En fait, si c'est un compte courant, je filtre par user.id.
    
    query = query.filter(Booking.user_id == user.id)
    
    payments = query.order_by(Payment.date.desc() if hasattr(Payment, 'date') else Payment.created_at.desc()).all()
    
    return jsonify({
        'payments': [p.to_dict() for p in payments],
        'total': len(payments)
    }), 200
