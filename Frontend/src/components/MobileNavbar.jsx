import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import '../styles/components/mobileNavbar.css';

const MobileNavbar = () => {
    const { notifications } = useNotification();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const unreadMessages = notifications.filter(n => !n.is_read && n.type === 'message').length;
    const unreadNotifications = notifications.filter(n => !n.is_read && n.type !== 'message').length;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/connexion');
        window.location.reload();
    };

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

            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <i className="fa-solid fa-user"></i>
                <span>Profil</span>
            </NavLink>

            <button onClick={handleLogout} className="nav-item logout-btn">
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>Quitter</span>
            </button>
        </div>
    );
};

export default MobileNavbar;
