import React from "react";
import "../styles/Components/SideBar.css";
import logo from "../logo.png";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import DomainRoundedIcon from "@mui/icons-material/DomainRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import GradeRoundedIcon from "@mui/icons-material/GradeRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useNotification } from "../context/NotificationContext";

export default function Sidebar({ isOpen, activeItem, setActiveItem }) {
  const { notifications } = useNotification();
  
  const getUnreadCount = (type) => {
    return notifications.filter(n => !n.is_read && n.type === type).length;
  };

  const menuItems = [
    { text: "Dashboard", icon: <BarChartRoundedIcon /> },
    { text: "Properties", icon: <DomainRoundedIcon /> },
    { text: "Reservations", icon: <AssignmentRoundedIcon />, badge: getUnreadCount('booking') },
    { text: "Calendar", icon: <EventRoundedIcon /> },
    { text: "Reviews", icon: <GradeRoundedIcon /> },
    { text: "Messages", icon: <MailOutlineRoundedIcon />, badge: getUnreadCount('message') },
    { text: "Payments", icon: <CreditCardRoundedIcon />, badge: getUnreadCount('payment') },
    { text: "Settings", icon: <SettingsOutlinedIcon /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-icon-bg">
          <img src={logo} alt="Hotely Logo" />
        </div>
        <h2>HOTELY</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveItem(item.text)}
            className={`nav-item ${activeItem === item.text ? "active" : ""}`}
            style={{ position: 'relative' }}
          >
            <span className="nav-icon" style={{ position: 'relative' }}>
              {item.icon}
              {item.badge > 0 && (
                <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-8px',
                    backgroundColor: '#e53e3e',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    lineHeight: 1
                }}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </span>
            <span className="nav-text">{item.text}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item">
          <span className="nav-icon">
            <LogoutRoundedIcon />
          </span>
          <span className="nav-text">Logout</span>
        </div>
      </div>
    </div>
  );
}
