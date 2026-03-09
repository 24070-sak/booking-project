import { Link, useLocation } from "react-router-dom";
import { resolveImageUrl } from "../utils/urlHelper";
const API = import.meta.env.VITE_API_URL || "";
import { useState, useEffect } from "react";
import logo from '../assets/logos/logo.svg'
import '../styles/pages/dashboard.css'
import DashboardOverview from "../components/DashboardOverview";
import DashboardProperties from "../components/DashboardProperties";
import DashboardReservations from "../components/DashboardReservations";
import DashboardCalendar from "../components/DashboardCalendar";
import DashboardReviews from "../components/DashboardReviews";
import DashboardMessages from "../components/DashboardMessages";
import DashboardAnalytics from "../components/DashboardAnalytics";
import DashboardSettings from "../components/DashboardSettings";
import { useNotification } from "../context/NotificationContext";

// Import SVG icons
import {
  SettingsIcon,
  LogoutIcon,
  HomeIcon,
  MenuIcon,
  DashboardIcon,
  PropertiesIcon,
  ReservationsIcon,
  AnalyticsIcon,
  MessagesIcon,
  ReviewsIcon
} from '../components/DashboardIcons';

function Dashboard() {
  const { notifications, markByTypeAsRead } = useNotification();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(location.state?.message || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper to get initials
  const getInitials = (firstName, lastName) => {
    if (!firstName) return "U";
    if (!lastName) return firstName.charAt(0).toUpperCase();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  useEffect(() => {
    if (activeTab === 'reservations') {
      markByTypeAsRead('booking');
    } else if (activeTab === 'messages') {
      markByTypeAsRead('message');
    }
  }, [activeTab]);

  useEffect(() => {
    if (location.state?.message) {
      setNotification(location.state.message);
      // Clear state to avoid showing it again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser && !parsedUser.access_dashboard) {
        alert("Accès refusé. Vous n'avez pas la permission d'accéder au Dashboard.");
        window.location.href = '/'; // Redirect home
      }
    } else {
      window.location.href = '/connexion';
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  const handleLabelClick = (e) => {
    // Find the closest parent with class 'label' or the element itself if it has the class
    const label = e.target.closest('.label');
    if (label && label.id) {
      setActiveTab(label.id);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  // Set default tab for admin to messages if it's dashboard
  // NOTE: This must be BEFORE any conditional returns (Rules of Hooks)
  useEffect(() => {
    if (isAdmin && activeTab === 'dashboard') {
      setActiveTab('messages');
    }
  }, [isAdmin, activeTab]);

  if (!user || (!user.access_dashboard && user.role !== 'admin')) {
    return <div className="dashboard-loading">Chargement ou Accès refusé...</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'properties':
        return <DashboardProperties />;
      case 'reservations':
        return <DashboardReservations
          targetBookingId={location.state?.bookingId}
          targetPaymentId={location.state?.paymentId}
          initialTab={location.state?.targetTab}
        />;
      case 'calendar':
        return <DashboardCalendar />;
      case 'reviews':
        return <DashboardReviews />;
      case 'messages':
        return <DashboardMessages />;
      case 'analytics':
        return <DashboardAnalytics />;
      case 'settings':
        return <DashboardSettings />;
      default:
        return <div style={{ padding: '20px' }}><h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2><p>This section is under construction.</p></div>;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="mobile-header">
        <button className="hamburger-menu" onClick={() => setIsSidebarOpen(true)}>
          <MenuIcon className="icon" />
        </button>
        <img src={logo} alt="Logo" className="mobile-logo" />
        <div style={{ width: '40px' }}></div> {/* Spacer */}
      </div>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className="dashboard">
        <div className={`dashboard-header ${isSidebarOpen ? 'open' : ''}`}>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            &times;
          </button>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="dashboard-labels">
          {!isAdmin && (
            <>
              <span className={`label ${activeTab === 'dashboard' ? 'selected' : ''}`} id="dashboard" onClick={handleLabelClick}>
                <DashboardIcon className="icon" />
                <span>Dashboard</span>
              </span>

              <span className={`label ${activeTab === 'properties' ? 'selected' : ''}`} id="properties" onClick={handleLabelClick}>
                <PropertiesIcon className="icon" />
                <span>Propriétés</span>
              </span>

              <span className={`label ${activeTab === 'reservations' ? 'selected' : ''}`} id="reservations" onClick={handleLabelClick}>
                <ReservationsIcon className="icon" />
                <span>Réservations</span>
                {notifications.filter(n => !n.is_read && n.type === 'booking').length > 0 && (
                  <span className="label-badge">
                    {notifications.filter(n => !n.is_read && n.type === 'booking').length}
                  </span>
                )}
              </span>

              <span className={`label ${activeTab === 'analytics' ? 'selected' : ''}`} id="analytics" onClick={handleLabelClick}>
                <AnalyticsIcon className="icon" />
                <span>Analytique</span>
              </span>
            </>
          )}

          <span className={`label ${activeTab === 'messages' ? 'selected' : ''}`} id="messages" onClick={handleLabelClick}>
            <MessagesIcon className="icon" />
            <span>Messages</span>
            {!isAdmin && notifications.filter(n => !n.is_read && n.type === 'message').length > 0 && (
              <span className="label-badge">
                {notifications.filter(n => !n.is_read && n.type === 'message').length}
              </span>
            )}
          </span>

          {!isAdmin && (
            <span className={`label ${activeTab === 'reviews' ? 'selected' : ''}`} id="reviews" onClick={handleLabelClick}>
              <ReviewsIcon className="icon" />
              <span>Avis</span>
            </span>
          )}

          <span className={`label ${activeTab === 'settings' ? 'selected' : ''}`} id="settings" onClick={handleLabelClick}>
            <SettingsIcon className="icon" />
            <span>Paramètres</span>
          </span>

          {user?.access_control_center && (
            <Link to="/control-center" className="label" style={{ textDecoration: 'none', color: 'inherit' }}>
              <DashboardIcon className="icon" id="control-center-link" />
              <span>Centre de Contrôle</span>
            </Link>
          )}

          <Link to="/" className="label">
            <HomeIcon className="icon" />
            <span>Aller à l'accueil</span>
          </Link>
        </div>
        <div>
          <Link to="/connexion" id="logout" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }}>
            <LogoutIcon className="icon" />
            Déconnexion
          </Link>
        </div>

      </div>
      <div className="dashboard-body">
        <div className="dashboard-user-profile">
          <div className="profile-img-container">
            {user.profile_picture ? (
              <img src={resolveImageUrl(user.profile_picture)} alt="Profile" />
            ) : (
              <div className="initials-fallback">
                {getInitials(user.first_name, user.last_name)}
              </div>
            )}
          </div>
          <div>
            <h2>
              {user.role === 'admin' ? user.first_name : (user.role === 'manager' ? (user.first_name?.replace(/Hôtel Manager/gi, "Hôtel") || "Hôtel") : `${user.first_name} ${user.last_name}`)}
            </h2>
            <p>{user.email}</p>
          </div>
        </div>

        {notification && (
          <div className="dashboard-notification" style={{
            padding: '15px 20px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #10b981'
          }}>
            <span><i className="fa-solid fa-circle-check" style={{ marginRight: '10px' }}></i> {notification}</span>
            <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontSize: '18px' }}>&times;</button>
          </div>
        )}
        {renderContent()}
      </div>
      </div>
    </div>
  )
}

export default Dashboard;