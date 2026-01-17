import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import '../styles/components/dashboardAnalytics.css';

const DashboardAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await getDashboardStats();
                setAnalytics(data.analytics);
                setStats(data.stats);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div>Chargement des analyses...</div>;

    return (
        <div className="dashboard-content dashboard-analytics-content">
            <h2>Analytique</h2>

            <div className="analytics-grid">
                {/* Revenue Chart */}
                <div className="analytics-card">
                    <h3>Aperçu des Revenus (7 jours)</h3>
                    <div className="chart-container">
                        {analytics?.revenueByDay?.map((item, i) => (
                            <div key={i} className="chart-bar" style={{ height: `${(item.amount / 5000) * 100}%` }}>
                                <span className="chart-label">{item.day}</span>
                                <div className="tooltip">{item.amount} €</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Occupancy Rate */}
                <div className="analytics-card">
                    <h3>Taux d'Occupation</h3>
                    <div className="occupancy-container">
                        <div className="pie-chart" style={{ background: `conic-gradient(#4a90e2 ${stats?.occupancyRate}%, #e2e8f0 0)` }}>
                            <div className="pie-inner">
                                <span className="pie-value">{stats?.occupancyRate}%</span>
                                <span className="pie-label">Occupé</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Properties */}
                <div className="analytics-card">
                    <h3>Top Établissements</h3>
                    <ul className="top-properties-list">
                        {analytics?.topProperties?.map((prop, i) => (
                            <li key={i} className="property-item">
                                <span>{prop.name}</span>
                                <span className="property-revenue">{prop.revenue} €</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Visitor Stats Placeholder */}
                <div className="analytics-card">
                    <h3>Statistiques Visiteurs</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">1,240</div>
                            <div className="stat-label">Vues de page</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">350</div>
                            <div className="stat-label">Visiteurs uniques</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">12%</div>
                            <div className="stat-label">Taux de rebond</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;
