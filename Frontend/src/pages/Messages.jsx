import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import DashboardMessages from '../components/DashboardMessages';
import '../styles/pages/messages.css';
import '../styles/components/dashboardMessages.css';
import '../styles/components/dashboardMessagesMobile.css';

function Messages() {
    const { notifications, markByTypeAsRead } = useNotification();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        markByTypeAsRead('message');
    }, [markByTypeAsRead]);

    return (
        <div className="messages-page-wrapper">
            {/* Top Navigation (Desktop) - Adjusted for better layout */}
            <div className="messages-top-nav">
                <Link to="/" className="messages-back-btn" title="Accueil">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <div className="messages-header-content">
                    <h1 className="messages-page-title">
                        Vos Conversations
                        {notifications.filter(n => !n.is_read && n.type === 'message').length > 0 && (
                            <span className="label-badge">
                                {notifications.filter(n => !n.is_read && n.type === 'message').length}
                            </span>
                        )}
                    </h1>
                </div>
            </div>

            {/* Mobile Header (Only visible on small screens) */}
            <div className="mobile-only-header">
                <Link to="/" className="mobile-back-btn" title="Accueil">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <h2>
                    Messages
                    {notifications.filter(n => !n.is_read && n.type === 'message').length > 0 && (
                        <span className="label-badge">
                            {notifications.filter(n => !n.is_read && n.type === 'message').length}
                        </span>
                    )}
                </h2>
            </div>

            {/* Main Messages Content */}
            <div className="messages-content">
                <DashboardMessages
                    targetSenderId={location.state?.senderId}
                />
            </div>
        </div>
    );
}

export default Messages;