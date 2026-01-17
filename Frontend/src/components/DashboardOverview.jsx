import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import '../styles/components/dashboardOverview.css';

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        activeProperties: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getDashboardStats();
                setStats(data.stats);
                setRecentActivity(data.recentActivity);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="dashboard-content dashboard-overview-content">
            <h2>Dashboard Overview</h2>
            <div className="stats-container">
                <div className="stat-card">
                    <h3>Total Bookings</h3>
                    <p>{stats.totalBookings}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p>{stats.totalRevenue.toLocaleString()} €</p>
                </div>
                <div className="stat-card">
                    <h3>Active Properties</h3>
                    <p>{stats.activeProperties}</p>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <ul className="activity-list">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                            <li key={index} className="activity-item">
                                {activity.message} - <small>{activity.date}</small>
                            </li>
                        ))
                    ) : (
                        <p>Aucune activité récente.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default DashboardOverview;
