import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import '../styles/components/mobileNavbar.css';

const MobileNavbar = () => {
    const { notifications } = useNotification();
    const user = JSON.parse(localStorage.getItem('user'));

    const unreadMessages = notifications.filter(n => !n.is_read && n.type === 'message').length;
    const unreadNotifications = notifications.filter(n => !n.is_read && n.type !== 'message').length;

    if (!user) return null;

    return (
        <div className="mobile-navbar">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <i className="fa-solid fa-house"></i>
                <span>Accueil</span>
            </NavLink>

            <NavLink to="/notifications" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <div className="icon-wrapper">
                    <i className="fa-solid fa-bell"></i>
                    {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
                </div>
                <span>Alertes</span>
            </NavLink>

            <NavLink to="/messages" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <div className="icon-wrapper">
                    <i className="fa-solid fa-comment-dots"></i>
                    {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
                </div>
                <span>Messages</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <i className="fa-solid fa-user"></i>
                <span>Profil</span>
            </NavLink>
        </div>
    );
};

export default MobileNavbar;
