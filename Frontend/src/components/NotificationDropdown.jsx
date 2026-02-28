import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { getNotifications } from '../services/notificationService';

const NotificationDropdown = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const data = await getNotifications();
                const unread = (data.notifications || []).filter(n => !n.is_read).length;
                setUnreadCount(unread);
            } catch (err) {
                console.error("Impossible de récupérer les notifications:", err);
            }
        };
        fetchCount();
    }, []);

    return (
        <span
            onClick={() => navigate('/notifications')}
            title="Notifications"
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
        >
            <FaBell style={{ fontSize: '1.2rem', color: '#006233' }} />
            {unreadCount > 0 && (
                <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    color: '#e53e3e',
                    lineHeight: 1,
                    pointerEvents: 'none',
                }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </span>
    );
};

export default NotificationDropdown;
