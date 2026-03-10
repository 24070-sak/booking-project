import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
        const intervalId = setInterval(fetchAnalytics, 15000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div className="analytics-loading">Chargement des analyses...</div>;

    // Occupancy Pie Data
    const occupancyRate = stats?.occupancyRate || 0;
    const occupancyData = [
        { name: 'Occupé', value: occupancyRate },
        { name: 'Libre', value: 100 - occupancyRate }
    ];
    const COLORS = ['#006233', '#e2e8f0'];

    return (
        <div className="dashboard-content dashboard-analytics-content">
            <h2 className="dashboard-section-title">Aperçu Analytique</h2>
            <p className="dashboard-section-subtitle">Performances de vos établissements</p>

            <div className="analytics-grid">
                
                {/* CARD 1: Visitor Stats */}
                <div className="analytics-card visitor-stats-card">
                    <h3><i className="fa-solid fa-users"></i> Statistiques Visiteurs</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <i className="fa-solid fa-eye stat-icon"></i>
                            <div className="stat-value">{analytics?.visitorStats?.pageViews || 0}</div>
                            <div className="stat-label">Vues de l'hôtel</div>
                        </div>
                        <div className="stat-item">
                            <i className="fa-solid fa-calendar-check stat-icon"></i>
                            <div className="stat-value">{stats?.totalBookings || 0}</div>
                            <div className="stat-label">Réservations effectuées</div>
                        </div>
                        <div className="stat-item highlight-bounce">
                            <i className="fa-solid fa-arrow-right-from-bracket stat-icon"></i>
                            <div className="stat-value">{analytics?.visitorStats?.bounceRate || 0}%</div>
                            <div className="stat-label">Taux de rebond</div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Occupancy Rate */}
                <div className="analytics-card occupancy-card">
                    <h3><i className="fa-solid fa-bed"></i> Taux d'Occupation</h3>
                    <div className="occupancy-container" style={{ height: '220px', width: '100%', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="occupancy-center-label">
                            <span className="occupancy-percentage">{occupancyRate}%</span>
                            <span className="occupancy-text">Occupé</span>
                        </div>
                    </div>
                </div>

                {/* CARD 3: Revenue Analytics */}
                <div className="analytics-card revenue-card">
                    <h3><i className="fa-solid fa-chart-line"></i> Revenus (7 derniers jours)</h3>
                    <div className="chart-container" style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.revenueByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `€${val}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 98, 51, 0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
                                    formatter={(value) => [`${value} €`, 'Revenus']}
                                />
                                <Bar dataKey="amount" fill="#006233" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CARD 4: Top 3 Rooms */}
                <div className="analytics-card top-rooms-card">
                    <h3><i className="fa-solid fa-medal"></i> Top 3 Chambres (Revenus)</h3>
                    <ul className="top-rooms-list">
                        {analytics?.topRooms?.map((room, i) => (
                            <li key={i} className="top-room-item">
                                <div className="room-item-left">
                                    <div className={`rank-bubble rank-${i + 1}`}>{i + 1}</div>
                                    <div className="room-meta">
                                        <h4>{room.name}</h4>
                                        <span className="room-hotel">{room.hotel_name}</span>
                                    </div>
                                </div>
                                <div className="room-item-right">
                                    <span className="room-revenue">{room.revenue.toLocaleString()} €</span>
                                    <span className="room-bookings-count">{room.bookings} réservations</span>
                                </div>
                            </li>
                        ))}
                        {(!analytics?.topRooms || analytics.topRooms.length === 0) && (
                            <div className="no-data-state">
                                <i className="fa-solid fa-folder-open"></i>
                                <p>Aucune donnée de revenus disponible.</p>
                            </div>
                        )}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default DashboardAnalytics;
