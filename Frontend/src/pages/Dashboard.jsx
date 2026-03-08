import { Link, useLocation } from "react-router-dom";
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

// Import SVG icons
import {
  DashboardIcon,
  PropertiesIcon,
  ReservationsIcon,
  CalendarIcon,
  ReviewsIcon,
  MessagesIcon,
  PaymentsIcon,
  AnalyticsIcon,
  SettingsIcon,
  LogoutIcon
} from '../components/DashboardIcons';

function Dashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(location.state?.message || null);

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
    }
  };

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
        return <DashboardReservations />;
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
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="dashboard-labels">
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
          </span>

          <span className={`label ${activeTab === 'analytics' ? 'selected' : ''}`} id="analytics" onClick={handleLabelClick}>
            <AnalyticsIcon className="icon" />
            <span>Analytique</span>
          </span>

          <span className={`label ${activeTab === 'messages' ? 'selected' : ''}`} id="messages" onClick={handleLabelClick}>
            <MessagesIcon className="icon" />
            <span>Messages</span>
          </span>

          <span className={`label ${activeTab === 'reviews' ? 'selected' : ''}`} id="reviews" onClick={handleLabelClick}>
            <ReviewsIcon className="icon" />
            <span>Avis</span>
          </span>

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
        <div className="dashboard-user-profile" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          {user.profile_picture ? (
            <img src={user.profile_picture} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', marginRight: '15px' }}>
              <i className="fa-solid fa-user"></i>
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>{user.first_name} {user.last_name}</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{user.email}</p>
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
  )
}

export default Dashboard;