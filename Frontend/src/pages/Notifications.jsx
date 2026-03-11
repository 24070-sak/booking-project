import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { resolveImageUrl } from '../utils/urlHelper';
import '../styles/pages/notifications.css';

const Notifications = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotification();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread'
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch fresh data when entering the page
        const load = async () => {
            await fetchNotifications();
            setLoading(false);
        };
        load();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const displayed = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return 'fa-calendar-check';
            case 'payment': return 'fa-credit-card';
            case 'review': return 'fa-star';
            case 'message': return 'fa-envelope';
            default: return 'fa-bell';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds
        if (diff < 60) return "À l'instant";
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="notif-page">
            {/* Top bar */}
            <div className="notif-page-topbar-bg">
                <div className="notif-page-topbar">
                    <button className="notif-page-back" onClick={() => navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div className="notif-page-topbar-title">
                        <i className="fa-solid fa-bell"></i>
                        <h1>Notifications</h1>
                    </div>
                    {unreadCount > 0 && (
                        <button className="notif-page-mark-all" onClick={handleMarkAllAsRead}>
                            <i className="fa-solid fa-check-double"></i>
                            <span>Tout marquer lu</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="notif-page-filters-bg">
                <div className="notif-page-filters">
                    <button
                        className={`notif-filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Toutes <span className="tab-count">{notifications.length}</span>
                    </button>
                    <button
                        className={`notif-filter-tab ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Non lues <span className="tab-count">{unreadCount}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="notif-page-body">
                {loading ? (
                    <div className="notif-page-loading">
                        <div className="notif-spinner"></div>
                        <p>Chargement des notifications...</p>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="notif-page-empty">
                        <i className="fa-regular fa-bell-slash"></i>
                        <h3>Aucune notification</h3>
                        <p>{filter === 'unread' ? 'Toutes vos notifications ont été lues.' : 'Vous n\'avez pas encore de notifications.'}</p>
                        <Link to="/" className="notif-home-link">Retour à l'accueil</Link>
                    </div>
                ) : (
                    <div className="notif-page-list">
                        {displayed.map(notif => (
                            <div
                                key={notif.id}
                                className={`notif-page-item ${!notif.is_read ? 'unread' : ''}`}
                                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                            >
                                {/* Icon */}
                                <div className={`notif-page-icon ${!notif.is_read ? 'unread-icon' : ''}`}>
                                    {notif.type === 'message' && notif.sender_picture ? (
                                        <img
                                            src={resolveImageUrl(notif.sender_picture)}
                                            alt=""
                                            className="notif-sender-img"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    <i className={`fa-solid ${getIcon(notif.type)}`} style={{ display: notif.type === 'message' && notif.sender_picture ? 'none' : 'block' }}></i>
                                </div>

                                {/* Content */}
                                <div className="notif-page-content">
                                    <div className="notif-page-row">
                                        <p className="notif-page-title">
                                            {notif.type === 'message' && notif.sender_name
                                                ? `Message de ${notif.sender_name}`
                                                : notif.title
                                            }
                                        </p>
                                        {!notif.is_read && <span className="notif-dot"></span>}
                                    </div>
                                    <p className="notif-page-message">{notif.message}</p>
                                    <div className="notif-page-meta">
                                        <span className="notif-page-time">
                                            <i className="fa-regular fa-clock"></i>
                                            {formatDate(notif.created_at)}
                                        </span>
                                        <div className="notif-page-links" onClick={e => e.stopPropagation()}>
                                            {(notif.booking_id || notif.type === 'payment') && (
                                                <button
                                                    onClick={() => navigate('/dashboard', {
                                                        state: {
                                                            activeTab: 'reservations',
                                                            bookingId: notif.booking_id,
                                                            targetTab: notif.type === 'payment' ? 'payments' : 'bookings'
                                                        }
                                                    })}
                                                    className="notif-page-link-btn"
                                                >
                                                    <i className={`fa-solid ${notif.type === 'payment' ? 'fa-credit-card' : 'fa-calendar-check'}`}></i>
                                                    {notif.type === 'payment' ? 'Voir le paiement' : 'Voir la réservation'}
                                                </button>
                                            )}
                                            {notif.type === 'message' && (
                                                <button
                                                    onClick={() => navigate('/messages', {
                                                        state: { senderId: notif.sender_id }
                                                    })}
                                                    className="notif-page-link-btn"
                                                >
                                                    <i className="fa-solid fa-comment-dots"></i>
                                                    Voir le message
                                                </button>
                                            )}
                                            {notif.room_id && (
                                                <Link to={`/room/${notif.room_id}`} className="notif-page-link">
                                                    <i className="fa-solid fa-door-open"></i> Voir la chambre
                                                </Link>
                                            )}
                                            {notif.hotel_id && (
                                                <Link to={`/hotel/${notif.hotel_id}`} className="notif-page-link">
                                                    <i className="fa-solid fa-hotel"></i> Voir l'hôtel
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
