import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

        // Chargement initial
        fetchAnalytics();

        // Rafraîchissement automatique et dynamique toutes les 5 secondes
        const intervalId = setInterval(fetchAnalytics, 5000);

        // Nettoyage lors du démontage du composant
        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div>Chargement des analyses...</div>;

    return (
        <div className="dashboard-content dashboard-analytics-content">
            <h2>Analytique</h2>

            <div className="analytics-grid">
                {/* Revenue Chart */}
                <div className="analytics-card">
                    <h3>Aperçu des Revenus (7 jours)</h3>
                    <div className="chart-container" style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.revenueByDay}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#0b6ad6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Rate */}
                <div className="analytics-card">
                    <h3>Taux d'Occupation (% chambres occupées)</h3>
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
                    <h3>Top 3 Établissements (Réservations)</h3>
                    <ul className="top-properties-list">
                        {analytics?.topProperties?.map((prop, i) => (
                            <li key={i} className="property-item">
                                <span className="property-name-rank">
                                    <span className="rank-badge">#{i + 1}</span>
                                    {prop.name}
                                </span>
                                <div className="property-stats">
                                    <span className="property-bookings">{prop.bookings} réservations</span>
                                    <span className="property-revenue-amount">{prop.revenue.toLocaleString()} €</span>
                                </div>
                            </li>
                        ))}
                        {(!analytics?.topProperties || analytics.topProperties.length === 0) && (
                            <li className="property-item dummy">Aucune donnée disponible</li>
                        )}
                    </ul>
                </div>

                {/* Visitor Stats */}
                <div className="analytics-card">
                    <h3>Statistiques Visiteurs</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{analytics?.visitorStats?.pageViews || 0}</div>
                            <div className="stat-label">Vues de page (Total)</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{analytics?.visitorStats?.uniqueVisitors || 0}</div>
                            <div className="stat-label">Visiteurs uniques</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{analytics?.visitorStats?.bounceRate || 0}%</div>
                            <div className="stat-label">Taux de rebond (Moy)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;
