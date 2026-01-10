import React from 'react';
import '../styles/components/dashboardAnalytics.css';

const DashboardAnalytics = () => {
    return (
        <div className="dashboard-content dashboard-analytics-content">
            <h2>Analytics</h2>

            <div className="analytics-grid">

                {/* Revenue Chart Placeholder */}
                <div className="analytics-card">
                    <h3>Revenue Overview</h3>
                    <div className="chart-container">
                        {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="chart-bar" style={{ height: `${h}%` }}>
                                <span className="chart-label">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Occupancy Rate */}
                <div className="analytics-card">
                    <h3>Occupancy Rate</h3>
                    <div className="occupancy-container">
                        <div className="pie-chart">
                            <div className="pie-inner">
                                <span className="pie-value">75%</span>
                                <span className="pie-label">Occupied</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Properties */}
                <div className="analytics-card">
                    <h3>Top Performing Properties</h3>
                    <ul className="top-properties-list">
                        <li className="property-item">
                            <span>Sunset Villa</span>
                            <span className="property-revenue">15,000 MRU</span>
                        </li>
                        <li className="property-item">
                            <span>Ocean View Hotel</span>
                            <span className="property-revenue">10,000 MRU</span>
                        </li>
                        <li className="property-item">
                            <span>Desert Camp</span>
                            <span className="property-revenue">8,800 MRU</span>
                        </li>
                    </ul>
                </div>

                {/* Recent Views */}
                <div className="analytics-card">
                    <h3>Visitor Stats</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">1,240</div>
                            <div className="stat-label">Page Views</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">350</div>
                            <div className="stat-label">Unique Visitors</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">12%</div>
                            <div className="stat-label">Bounce Rate</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardAnalytics;
