import { Link } from "react-router-dom";
const API = import.meta.env.VITE_API_URL || "";
import { useState, useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/pages/dashboard.css'
import DashboardOverview from "../components/DashboardOverview";
import DashboardProperties from "../components/DashboardProperties";
import DashboardReservations from "../components/DashboardReservations";
import DashboardCalendar from "../components/DashboardCalendar";
import DashboardReviews from "../components/DashboardReviews";
import DashboardMessages from "../components/DashboardMessages";
import DashboardPayments from "../components/DashboardPayments";
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'properties':
        return isAdmin ? <DashboardProperties /> : <DashboardOverview />;
      case 'reservations':
        return <DashboardReservations />;
      case 'calendar':
        return <DashboardCalendar />;
      case 'reviews':
        return <DashboardReviews />;
      case 'messages':
        return <DashboardMessages />;
      case 'payments':
        return <DashboardPayments />;
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

          {isAdmin ? (
            // Onglets ADMIN
            <>
              <span className={`label ${activeTab === 'properties' ? 'selected' : ''}`} id="properties" onClick={handleLabelClick}>
                <PropertiesIcon className="icon" />
                <span>Properties</span>
              </span>
              <span className={`label ${activeTab === 'reservations' ? 'selected' : ''}`} id="reservations" onClick={handleLabelClick}>
                <ReservationsIcon className="icon" />
                <span>All Reservations</span>
              </span>
            </>
          ) : (
            // Onglets CLIENT
            <>
              <span className={`label ${activeTab === 'reservations' ? 'selected' : ''}`} id="reservations" onClick={handleLabelClick}>
                <ReservationsIcon className="icon" />
                <span>Mes Réservations</span>
              </span>
              <span className={`label ${activeTab === 'messages' ? 'selected' : ''}`} id="messages" onClick={handleLabelClick}>
                <MessagesIcon className="icon" />
                <span>Messages</span>
              </span>
              <span className={`label ${activeTab === 'payments' ? 'selected' : ''}`} id="payments" onClick={handleLabelClick}>
                <PaymentsIcon className="icon" />
                <span>Payments</span>
              </span>
              <span className={`label ${activeTab === 'analytics' ? 'selected' : ''}`} id="analytics" onClick={handleLabelClick}>
                <AnalyticsIcon className="icon" />
                <span>Analytics</span>
              </span>
              <span className={`label ${activeTab === 'reviews' ? 'selected' : ''}`} id="reviews" onClick={handleLabelClick}>
                <ReviewsIcon className="icon" />
                <span>Reviews</span>
              </span>
            </>
          )}

          <span className={`label ${activeTab === 'settings' ? 'selected' : ''}`} id="settings" onClick={handleLabelClick}>
            <SettingsIcon className="icon" />
            <span>Settings</span>
          </span>
        </div>
        <div>
          <Link to="/connexion" id="logout" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }}>
            <LogoutIcon className="icon" />
            Logout
          </Link>
        </div>

      </div>
      <div className="dashboard-body">
        {renderContent()}
      </div>
    </div>
  )
}

export default Dashboard;