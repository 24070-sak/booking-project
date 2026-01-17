from flask import Blueprint, jsonify
from app.models.review import Review

review_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@review_bp.route('', methods=['GET'])
def get_reviews():
    """Liste tous les avis"""
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    return jsonify({
        'reviews': [r.to_dict() for r in reviews],
        'total': len(reviews)
    }), 200
