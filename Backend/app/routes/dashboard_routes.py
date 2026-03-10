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
from app.utils.security import get_owned_hotel_ids

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Récupère les statistiques pour le dashboard"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
    if not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403

    is_admin = user.role == 'admin'
    owned_hotel_ids = [h.id for h in user.hotels]
    
    if not is_admin and not owned_hotel_ids:
        return jsonify({
            'stats': {'totalBookings': 0, 'totalRevenue': 0, 'activeProperties': 0, 'occupancyRate': 0},
            'recentActivity': [],
            'analytics': {'revenueByDay': [], 'topRooms': []}
        }), 200

    # Helper to apply ownership filter
    def apply_filter(query, join_room=True):
        if is_admin:
            return query
        if join_room:
            # Assumes query already joined Room or can join it
            # If query is on Booking, we need to join Room
            # But the caller usually sets up the join
            return query.filter(Room.hotel_id.in_(owned_hotel_ids))
        return query

    # 1. Total Bookings
    total_bookings = Booking.query.join(Room)
    if not is_admin:
        total_bookings = total_bookings.filter(Room.hotel_id.in_(owned_hotel_ids))
    total_bookings = total_bookings.count()
    
    # 2. Total Revenue
    revenue_query = (
        db.session.query(func.sum(Payment.amount))
        .join(Booking, Payment.booking_id == Booking.id)
        .join(Room, Booking.room_id == Room.id)
    )
    if not is_admin:
        revenue_query = revenue_query.filter(Room.hotel_id.in_(owned_hotel_ids))
    
    total_revenue_result = revenue_query.filter(Payment.status == 'completed').scalar()
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0

    # 3. Active Properties
    if is_admin:
        active_properties = Hotel.query.count()
    else:
        active_properties = len(owned_hotel_ids)
    
    # 4. Recent Activity
    recent_query = Booking.query.join(Room)
    if not is_admin:
        recent_query = recent_query.filter(Room.hotel_id.in_(owned_hotel_ids))
        
    recent_bookings = (
        recent_query.order_by(Booking.created_at.desc())
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

    # 5. Occupancy Rate (Calcul Réel)
    total_rooms_query = Room.query
    if not is_admin:
        total_rooms_query = total_rooms_query.filter(Room.hotel_id.in_(owned_hotel_ids))
    total_rooms = total_rooms_query.count()

    occupied_rooms = 0
    if total_rooms > 0:
        today = date.today()
        # Count rooms that have a booking active today
        occupied_query = db.session.query(func.count(func.distinct(Booking.room_id)))\
            .join(Room, Booking.room_id == Room.id)\
            .filter(Booking.check_in_date <= today)\
            .filter(Booking.check_out_date > today)\
            .filter(Booking.status.in_(['confirmed', 'pending']))
            
        if not is_admin:
            occupied_query = occupied_query.filter(Room.hotel_id.in_(owned_hotel_ids))
            
        occupied_rooms = occupied_query.scalar() or 0
        
    occupancy_rate = int((occupied_rooms / total_rooms) * 100) if total_rooms > 0 else 0

    # 6. Analytics - Real Revenue by Day (last 7 days)
    revenue_by_day = []
    days_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    
    for i in range(6, -1, -1):  # Last 7 days
        target_date = date.today() - timedelta(days=i)
        
        day_query = (
            db.session.query(func.sum(Payment.amount))
            .join(Booking, Payment.booking_id == Booking.id)
            .join(Room, Booking.room_id == Room.id)
        )
        if not is_admin:
            day_query = day_query.filter(Room.hotel_id.in_(owned_hotel_ids))
            
        day_revenue = (
            day_query
            .filter(Payment.status == 'completed')
            .filter(func.date(Payment.paid_at) == target_date)
            .scalar()
        )
        
        day_name = days_fr[target_date.weekday()]
        revenue_by_day.append({
            'day': day_name,
            'amount': float(day_revenue) if day_revenue else 0
        })
    
    # Top 3 Rooms by Revenue
    top_rooms = []
    
    # Get all rooms belonging to the user's hotels
    rooms_query = Room.query
    if not is_admin:
        rooms_query = rooms_query.filter(Room.hotel_id.in_(owned_hotel_ids))
        
    all_rooms = rooms_query.all()
    
    for r in all_rooms:
        # Calculate revenue for this specific room
        room_revenue_query = db.session.query(func.sum(Payment.amount))\
            .join(Booking, Payment.booking_id == Booking.id)\
            .filter(Booking.room_id == r.id)\
            .filter(Payment.status == 'completed')
            
        room_revenue = room_revenue_query.scalar() or 0
        
        # Count bookings for this room just as a supplementary stat
        room_bookings_query = db.session.query(func.count(Booking.id))\
            .filter(Booking.room_id == r.id)\
            .filter(Booking.status != 'cancelled')
            
        room_bookings = room_bookings_query.scalar() or 0

        if room_revenue > 0 or room_bookings > 0:
            top_rooms.append({
                'name': r.name,
                'hotel_name': r.hotel.name if r.hotel else 'Inconnu',
                'bookings': room_bookings,
                'revenue': float(room_revenue)
            })
            
    # Sort by revenue (descending)
    top_rooms.sort(key=lambda x: x['revenue'], reverse=True)
    top_rooms = top_rooms[:3] # Top 3

    # 7. Visitor Stats
    hotels_query = Hotel.query
    if not is_admin:
        hotels_query = hotels_query.filter(Hotel.id.in_(owned_hotel_ids))
    
    all_hotels = hotels_query.all()
    
    total_views = sum(h.views for h in all_hotels)
    total_unique = sum(h.unique_visitors for h in all_hotels)
    
    # Real Data calculations for Bounce Rate
    # Bounce rate = percentage of views that did not result in a booking
    if total_views > 0:
        actual_bounce = max(0.0, min(100.0, float(((total_views - total_bookings) / total_views) * 100)))
        avg_bounce = int(actual_bounce)
    else:
        avg_bounce = 0

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
            'topRooms': top_rooms,
            'visitorStats': {
                'pageViews': total_views,
                'uniqueVisitors': total_unique,
                'bounceRate': int(avg_bounce)
            }
        }
    }), 200

@dashboard_bp.route('/analytics/detailed', methods=['GET'])
@jwt_required()
def get_detailed_analytics():
    """Récupère des analytics détaillées"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.access_dashboard:
        return jsonify({'error': 'Accès interdit'}), 403
    
    is_admin = user.role == 'admin'
    owned_hotel_ids = [h.id for h in user.hotels]
    
    if not is_admin and not owned_hotel_ids:
        return jsonify({
            'bookingsByStatus': {},
            'revenueByMonth': [],
            'averageBookingValue': 0,
            'totalGuests': 0
        }), 200
    
    # Bookings by status
    bookings_by_status = {}
    for status in ['pending', 'confirmed', 'cancelled', 'completed']:
        query = Booking.query.join(Room)
        if not is_admin:
            query = query.filter(Room.hotel_id.in_(owned_hotel_ids))
            
        count = query.filter(Booking.status == status).count()
        bookings_by_status[status] = count
    
    # Revenue by month (last 6 months)
    revenue_by_month = []
    for i in range(5, -1, -1):
        target_month = date.today().replace(day=1) - timedelta(days=i*30)
        
        rev_query = (
            db.session.query(func.sum(Payment.amount))
            .join(Booking, Payment.booking_id == Booking.id)
            .join(Room, Booking.room_id == Room.id)
        )
        
        if not is_admin:
            rev_query = rev_query.filter(Room.hotel_id.in_(owned_hotel_ids))
            
        month_revenue = (
            rev_query
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
    avg_query = db.session.query(func.avg(Booking.total_price)).join(Room)
    if not is_admin:
        avg_query = avg_query.filter(Room.hotel_id.in_(owned_hotel_ids))
        
    avg_booking = avg_query.scalar()
    
    # Total guests
    guests_query = db.session.query(func.sum(Booking.num_guests)).join(Room)
    if not is_admin:
        guests_query = guests_query.filter(Room.hotel_id.in_(owned_hotel_ids))
        
    total_guests = guests_query.scalar()
    
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
    current_user_id = int(get_jwt_identity())
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
    query = Review.query\
        .join(Room, Review.room_id == Room.id)
    
    if user.role != 'admin':
        query = query.filter(Room.hotel_id.in_(owned_hotel_ids))
    
    reviews = query.all()
    
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
    current_user_id = int(get_jwt_identity())
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
    guest_ids_query = db.session.query(Booking.user_id.distinct())\
        .join(Room, Booking.room_id == Room.id)
    
    if user.role != 'admin':
        guest_ids_query = guest_ids_query.filter(Room.hotel_id.in_(owned_hotel_ids))
        
    guest_ids = [gid[0] for gid in guest_ids_query.all()]
    
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
