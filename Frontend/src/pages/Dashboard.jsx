const API = import.meta.env.VITE_API_URL || "";
import { useState, useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/pages/dashboard.css'

function Dashboard() {
  const handleLabelClick = (e) => {
    document.querySelectorAll('.dashboard-labels .label').forEach(span => {
      span.classList.remove('selected');
    });
    e.target.classList.add('selected');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="dashboard-labels">
          <span className="label selected" id="dashboard" onClick={handleLabelClick}>Dashboard</span>
          <span className="label" id="properties" onClick={handleLabelClick}>Properties</span>
          <span className="label" id="reservations" onClick={handleLabelClick}>Reservations</span>
          <span className="label" id="calendar" onClick={handleLabelClick}>Calendar</span>
          <span className="label" id="reviews" onClick={handleLabelClick}>Reviews</span>
          <span className="label" id="messages" onClick={handleLabelClick}>Messages</span>
          <span className="label" id="payements" onClick={handleLabelClick}>Payments</span>
          <span className="label" id="analytics" onClick={handleLabelClick}>Analytics</span>
          <span className="label" id="settings" onClick={handleLabelClick}>Settings</span>
        </div>
        <div>
            <span id="logout">Logout</span>
        </div>
        
      </div>
      <div className="dashboard-body">

      </div>
    </div>
  )
}

export default Dashboard;