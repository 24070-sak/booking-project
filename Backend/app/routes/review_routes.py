from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.review import Review
from app.models.user import User
from app.models.room import Room
from app.models.booking import Booking

review_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

def _update_hotel_rating(hotel):
    from sqlalchemy import func
    avg_rating = db.session.query(func.avg(Review.rating))\
        .join(Room, Review.room_id == Room.id)\
        .filter(Room.hotel_id == hotel.id)\
        .scalar()
    
    if avg_rating:
        hotel.rating = round(float(avg_rating), 1)
    else:
        hotel.rating = 0.0
    db.session.commit()

@review_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_reviews():
    """Liste tous les avis ou filtre par propriétaire"""
    current_user_id = get_jwt_identity()
    
    if current_user_id:
        user = User.query.get(current_user_id)
        
        # If user has dashboard access and owns hotels, show only their hotel reviews
        if user and user.access_dashboard and user.hotels.count() > 0:
            owned_hotel_ids = [h.id for h in user.hotels]
            reviews = Review.query\
                .join(Room, Review.room_id == Room.id)\
                .filter(Room.hotel_id.in_(owned_hotel_ids))\
                .order_by(Review.created_at.desc())\
                .all()
        else:
            # Regular users see all reviews
            reviews = Review.query.order_by(Review.created_at.desc()).all()
    else:
        # Non-authenticated users see all reviews
        reviews = Review.query.order_by(Review.created_at.desc()).all()
    
    return jsonify({
        'reviews': [r.to_dict() for r in reviews],
        'total': len(reviews)
    }), 200

@review_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    """Créer un nouvel avis"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validation
    if not data.get('room_id') or not data.get('rating'):
        return jsonify({'error': 'room_id et rating sont requis'}), 400
    
    if not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
        return jsonify({'error': 'Le rating doit être entre 1 et 5'}), 400
    
    # Vérifier que la chambre existe
    room = Room.query.get(data['room_id'])
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
    

    
    # Créer l'avis
    review = Review(
        user_id=user_id,
        room_id=data['room_id'],
        rating=data['rating'],
        comment=data.get('comment', '')
    )
    
    db.session.add(review)
    db.session.commit()
    
    # Update Hotel Rating
    _update_hotel_rating(room.hotel)
    
    return jsonify({
        'message': 'Avis créé avec succès',
        'review': review.to_dict()
    }), 201

@review_bp.route('/<int:review_id>', methods=['GET'])
def get_review(review_id):
    """Obtenir un avis spécifique"""
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Avis non trouvé'}), 404
    
    return jsonify({'review': review.to_dict()}), 200

@review_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    """Mettre à jour un avis"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Avis non trouvé'}), 404
    
    # Seul l'auteur ou un admin peut modifier
    if review.user_id != user_id and user.role not in ['admin', 'manager']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    data = request.get_json()
    
    if 'rating' in data:
        if not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
            return jsonify({'error': 'Le rating doit être entre 1 et 5'}), 400
        review.rating = data['rating']
    
    if 'comment' in data:
        review.comment = data['comment']
    
    if 'is_verified' in data and user.role in ['admin', 'manager']:
        review.is_verified = data['is_verified']
    
    db.session.commit()
    
    # Update Hotel Rating
    # Need to get the hotel associated with this review
    # Review -> Room -> Hotel
    if review.room and review.room.hotel:
        _update_hotel_rating(review.room.hotel)
    
    return jsonify({
        'message': 'Avis mis à jour',
        'review': review.to_dict()
    }), 200

@review_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """Supprimer un avis"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Avis non trouvé'}), 404
    
    # Seul l'auteur ou un admin peut supprimer
    if review.user_id != user_id and user.role not in ['admin', 'manager']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    # Capture hotel before delete
    hotel = None
    if review.room and review.room.hotel:
        hotel = review.room.hotel

    db.session.delete(review)
    db.session.commit()

    # Update Hotel Rating
    if hotel:
        _update_hotel_rating(hotel)
    
    return jsonify({'message': 'Avis supprimé avec succès'}), 200

@review_bp.route('/room/<int:room_id>', methods=['GET'])
def get_room_reviews(room_id):
    """Obtenir tous les avis d'une chambre"""
    room = Room.query.get(room_id)
    
    if not room:
        return jsonify({'error': 'Chambre non trouvée'}), 404
    
    reviews = Review.query.filter_by(room_id=room_id)\
        .order_by(Review.created_at.desc())\
        .all()
    
    return jsonify({
        'reviews': [r.to_dict() for r in reviews],
        'total': len(reviews),
        'average_rating': sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    }), 200

@review_bp.route('/hotel/<int:hotel_id>', methods=['GET'])
def get_hotel_reviews(hotel_id):
    """Obtenir tous les avis d'un hôtel"""
    reviews = Review.query\
        .join(Room, Review.room_id == Room.id)\
        .filter(Room.hotel_id == hotel_id)\
        .order_by(Review.created_at.desc())\
        .all()
    
    return jsonify({
        'reviews': [r.to_dict() for r in reviews],
        'total': len(reviews),
        'average_rating': sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    }), 200

@review_bp.route('/<int:review_id>/reply', methods=['POST'])
@jwt_required()
def reply_to_review(review_id):
    """Permet au propriétaire de l'hôtel de répondre à un avis"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Avis non trouvé'}), 404
        
    # Vérifier que l'utilisateur est le propriétaire de l'hôtel
    hotel = review.room.hotel
    if str(hotel.user_id) != str(user_id) and user.role not in ['admin', 'manager']:
        return jsonify({'error': 'Accès non autorisé. Vous n\'êtes pas le propriétaire.'}), 403
        
    data = request.get_json()
    reply = data.get('reply')
    
    if not reply:
        return jsonify({'error': 'La réponse est requise'}), 400
        
    review.reply = reply
    db.session.commit()
    
    return jsonify({
        'message': 'Réponse ajoutée avec succès',
        'review': review.to_dict()
    }), 200

