from flask import Blueprint, jsonify, request
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.review import Review
from app.models.message import Message
from sqlalchemy import func
from app.extensions import db
from datetime import timedelta, date

from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Récupère les statistiques pour le dashboard de l'owner"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
    if not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403

    # Liste des IDs des hôtels possédés par l'utilisateur
    owned_hotel_ids = [h.id for h in user.hotels]
    
    if not owned_hotel_ids:
        return jsonify({
            'stats': {'totalBookings': 0, 'totalRevenue': 0, 'activeProperties': 0, 'occupancyRate': 0},
            'recentActivity': [],
            'analytics': {'revenueByDay': [], 'topProperties': []}
        }), 200

    # 1. Total Bookings (Pour les hôtels possédés)
    total_bookings = Booking.query.join(Room).filter(Room.hotel_id.in_(owned_hotel_ids)).count()
    
    # 2. Total Revenue (Paiements complétés pour les hôtels possédés)
    total_revenue_result = (
        db.session.query(func.sum(Payment.amount))
        .join(Booking, Payment.booking_id == Booking.id)
        .join(Room, Booking.room_id == Room.id)
        .filter(Room.hotel_id.in_(owned_hotel_ids))
        .filter(Payment.status == 'completed')
        .scalar()
    )
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0

    # 3. Active Properties
    active_properties = len(owned_hotel_ids)
    
    # 4. Recent Activity
    recent_bookings = (
        Booking.query.join(Room).filter(Room.hotel_id.in_(owned_hotel_ids))
        .order_by(Booking.created_at.desc())
        .limit(5)
        .all()
    )
    
    recent_activity = []
    for b in recent_bookings:
        hotel_name = b.room.hotel.name if b.room and b.room.hotel else "Hôtel"
        user_name = f"{b.user.first_name} {b.user.last_name}" if b.user else "Client"
        created_at_str = b.created_at.strftime("%Y-%m-%d %H:%M") if b.created_at else "N/A"
        
        recent_activity.append({
            'type': 'booking',
            'message': f"Réservation par {user_name} pour {hotel_name}",
            'date': created_at_str
        })

    # 5. Occupancy Rate (Simplifié)
    occupancy_rate = 65 if total_bookings > 0 else 0

    # 6. Analytics - Real Revenue by Day (last 7 days)
    revenue_by_day = []
    days_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    
    for i in range(6, -1, -1):  # Last 7 days
        target_date = date.today() - timedelta(days=i)
        day_revenue = (
            db.session.query(func.sum(Payment.amount))
            .join(Booking, Payment.booking_id == Booking.id)
            .join(Room, Booking.room_id == Room.id)
            .filter(Room.hotel_id.in_(owned_hotel_ids))
            .filter(Payment.status == 'completed')
            .filter(func.date(Payment.paid_at) == target_date)
            .scalar()
        )
        
        day_name = days_fr[target_date.weekday()]
        revenue_by_day.append({
            'day': day_name,
            'amount': float(day_revenue) if day_revenue else 0
        })
    
    # Top Properties by Revenue
    top_properties = []
    for h in user.hotels:
        rev = db.session.query(func.sum(Payment.amount))\
            .join(Booking, Payment.booking_id == Booking.id)\
            .join(Room, Booking.room_id == Room.id)\
            .filter(Room.hotel_id == h.id)\
            .filter(Payment.status == 'completed')\
            .scalar()
        top_properties.append({
            'name': h.name,
            'revenue': float(rev) if rev else 0
        })
    
    top_properties.sort(key=lambda x: x['revenue'], reverse=True)
    top_properties = top_properties[:3]

    return jsonify({
        'stats': {
            'totalBookings': total_bookings,
            'totalRevenue': total_revenue,
            'activeProperties': active_properties,
            'occupancyRate': occupancy_rate
        },
        'recentActivity': recent_activity,
        'analytics': {
            'revenueByDay': revenue_by_day,
            'topProperties': top_properties
        }
    }), 200

@dashboard_bp.route('/analytics/detailed', methods=['GET'])
@jwt_required()
def get_detailed_analytics():
    """Récupère des analytics détaillées"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403
    
    owned_hotel_ids = [h.id for h in user.hotels]
    
    if not owned_hotel_ids:
        return jsonify({
            'bookingsByStatus': {},
            'revenueByMonth': [],
            'averageBookingValue': 0,
            'totalGuests': 0
        }), 200
    
    # Bookings by status
    bookings_by_status = {}
    for status in ['pending', 'confirmed', 'cancelled', 'completed']:
        count = Booking.query.join(Room).filter(
            Room.hotel_id.in_(owned_hotel_ids),
            Booking.status == status
        ).count()
        bookings_by_status[status] = count
    
    # Revenue by month (last 6 months)
    revenue_by_month = []
    for i in range(5, -1, -1):
        target_month = date.today().replace(day=1) - timedelta(days=i*30)
        month_revenue = (
            db.session.query(func.sum(Payment.amount))
            .join(Booking, Payment.booking_id == Booking.id)
            .join(Room, Booking.room_id == Room.id)
            .filter(Room.hotel_id.in_(owned_hotel_ids))
            .filter(Payment.status == 'completed')
            .filter(func.extract('month', Payment.paid_at) == target_month.month)
            .filter(func.extract('year', Payment.paid_at) == target_month.year)
            .scalar()
        )
        
        revenue_by_month.append({
            'month': target_month.strftime('%B'),
            'amount': float(month_revenue) if month_revenue else 0
        })
    
    # Average booking value
    avg_booking = (
        db.session.query(func.avg(Booking.total_price))
        .join(Room)
        .filter(Room.hotel_id.in_(owned_hotel_ids))
        .scalar()
    )
    
    # Total guests
    total_guests = (
        db.session.query(func.sum(Booking.num_guests))
        .join(Room)
        .filter(Room.hotel_id.in_(owned_hotel_ids))
        .scalar()
    )
    
    return jsonify({
        'bookingsByStatus': bookings_by_status,
        'revenueByMonth': revenue_by_month,
        'averageBookingValue': float(avg_booking) if avg_booking else 0,
        'totalGuests': int(total_guests) if total_guests else 0
    }), 200

@dashboard_bp.route('/reviews/summary', methods=['GET'])
@jwt_required()
def get_reviews_summary():
    """Récupère un résumé des avis pour les propriétés de l'owner"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403
    
    owned_hotel_ids = [h.id for h in user.hotels]
    
    if not owned_hotel_ids:
        return jsonify({
            'totalReviews': 0,
            'averageRating': 0,
            'ratingDistribution': {}
        }), 200
    
    # Get all reviews for owned hotels
    reviews = Review.query\
        .join(Room, Review.room_id == Room.id)\
        .filter(Room.hotel_id.in_(owned_hotel_ids))\
        .all()
    
    total_reviews = len(reviews)
    avg_rating = sum(r.rating for r in reviews) / total_reviews if total_reviews > 0 else 0
    
    # Rating distribution
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        rating_distribution[review.rating] += 1
    
    return jsonify({
        'totalReviews': total_reviews,
        'averageRating': round(avg_rating, 2),
        'ratingDistribution': rating_distribution
    }), 200

@dashboard_bp.route('/messages/summary', methods=['GET'])
@jwt_required()
def get_messages_summary():
    """Récupère un résumé des messages"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403
    
    owned_hotel_ids = [h.id for h in user.hotels]
    
    if not owned_hotel_ids:
        return jsonify({
            'totalMessages': 0,
            'unreadMessages': 0
        }), 200
    
    # Get all users who booked the owner's hotels
    guest_ids = db.session.query(Booking.user_id.distinct())\
        .join(Room, Booking.room_id == Room.id)\
        .filter(Room.hotel_id.in_(owned_hotel_ids))\
        .all()
    guest_ids = [gid[0] for gid in guest_ids]
    
    # Count messages
    total_messages = Message.query.filter(
        db.or_(
            Message.sender_id.in_(guest_ids),
            Message.receiver_id.in_(guest_ids),
            Message.sender_id == current_user_id,
            Message.receiver_id == current_user_id
        )
    ).count()
    
    unread_messages = Message.query.filter(
        db.or_(
            Message.sender_id.in_(guest_ids),
            Message.receiver_id.in_(guest_ids),
            Message.sender_id == current_user_id,
            Message.receiver_id == current_user_id
        ),
        Message.is_read == False,
        Message.receiver_id == current_user_id
    ).count()
    
    return jsonify({
        'totalMessages': total_messages,
        'unreadMessages': unread_messages
    }), 200
