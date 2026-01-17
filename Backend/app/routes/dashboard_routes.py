from flask import Blueprint, jsonify
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.hotel import Hotel
from app.models.room import Room
from sqlalchemy import func
from app.extensions import db

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    """Récupère les statistiques globales pour le dashboard"""
    
    # 1. Total Bookings
    total_bookings = Booking.query.count()
    
    # 2. Total Revenue (Somme des paiements 'completed' ou 'confirmed')
    # On suppose que le champ 'status' dans Payment est 'completed'
    total_revenue_result = (
        db.session.query(func.sum(Payment.amount))
        .filter(Payment.status == 'completed')
        .scalar()
    )
    total_revenue = total_revenue_result if total_revenue_result else 0.0

    # 3. Active Properties
    active_properties = Hotel.query.count()
    
    # 4. Recent Activity (Exemple simplifié : 5 dernières réservations)
    recent_bookings = (
        Booking.query.order_by(Booking.created_at.desc())
        .limit(5)
        .all()
    )
    
    recent_activity = []
    for b in recent_bookings:
        hotel_name = b.room.hotel.name if b.room and b.room.hotel else "Hôtel inconnu"
        user_name = f"{b.user.first_name} {b.user.last_name}" if b.user else "Invité"
        created_at_str = b.created_at.strftime("%Y-%m-%d %H:%M") if b.created_at else "N/A"
        
        recent_activity.append({
            'type': 'booking',
            'message': f"Nouvelle réservation par {user_name} pour {hotel_name}",
            'date': created_at_str
        })

    # 5. Revenue by day (last 7 days)
    # This is a simplified version, in real app would use date manipulation
    revenue_by_day = [
        {'day': 'Lun', 'amount': 1200},
        {'day': 'Mar', 'amount': 1800},
        {'day': 'Mer', 'amount': 1500},
        {'day': 'Jeu', 'amount': 2200},
        {'day': 'Ven', 'amount': 3000},
        {'day': 'Sam', 'amount': 4500},
        {'day': 'Dim', 'amount': 3800}
    ]
    
    # 6. Occupancy Rate
    total_rooms = db.session.query(func.count(Hotel.id)).scalar() # Assuming 1 room per hotel for simplified demo or just use a fixed number
    # For now, let's use a dummy but logical calculation
    occupancy_rate = 75 if total_bookings > 0 else 0

    # 7. Top Properties
    top_properties = []
    hotels = Hotel.query.limit(3).all()
    for h in hotels:
        rev = db.session.query(func.sum(Booking.total_price))\
            .join(Room, Booking.room_id == Room.id)\
            .filter(Room.hotel_id == h.id)\
            .scalar()
        top_properties.append({
            'name': h.name,
            'revenue': float(rev) if rev else 0
        })

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
