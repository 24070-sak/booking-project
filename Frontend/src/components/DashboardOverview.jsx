import React from 'react';
import '../styles/components/dashboardOverview.css';

const DashboardOverview = () => {
    return (
        <div className="dashboard-content dashboard-overview-content">
            <h2>Dashboard Overview</h2>
            <div className="stats-container">
                <div className="stat-card">
                    <h3>Total Bookings</h3>
                    <p>124</p>
                </div>
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p>$12,450</p>
                </div>
                <div className="stat-card">
                    <h3>Active Properties</h3>
                    <p>5</p>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <ul className="activity-list">
                    <li className="activity-item">New booking for <strong>Sunset Villa</strong> - Today</li>
                    <li className="activity-item">New review for <strong>Ocean View Hotel</strong> - Yesterday</li>
                    <li className="activity-item">Payment received from <strong>John Doe</strong> - 2 days ago</li>
                </ul>
            </div>
        </div>
    );
};

export default DashboardOverview;
