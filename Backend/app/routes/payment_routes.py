from flask import Blueprint, jsonify
from app.models.payment import Payment

payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@payment_bp.route('', methods=['GET'])
def get_payments():
    """Liste tous les paiements"""
    payments = Payment.query.order_by(Payment.date.desc() if hasattr(Payment, 'date') else Payment.created_at.desc()).all()
    return jsonify({
        'payments': [p.to_dict() for p in payments],
        'total': len(payments)
    }), 200
