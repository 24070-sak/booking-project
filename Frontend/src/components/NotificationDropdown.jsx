import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';

const NotificationDropdown = () => {
    const { unreadCount } = useNotification();
    const navigate = useNavigate();

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
