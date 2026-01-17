import React, { useState, useEffect } from 'react';
import { updateProfile } from '../services/authService';
import '../styles/components/dashboardSettings.css';

const DashboardSettings = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        bookings: true,
        reviews: true
    });

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    const [message, setMessage] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setProfile({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, []);

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const data = await updateProfile(profile);
            localStorage.setItem('user', JSON.stringify(data.user));
            setMessage('Profil mis à jour avec succès !');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage('Erreur lors de la mise à jour.');
        }
    };

    return (
        <div className="dashboard-content dashboard-settings-content">
            <h2>Paramètres</h2>

            <div className="settings-grid">
                {/* Profile Settings */}
                <div className="settings-card">
                    <h3>Informations de Profil</h3>
                    {message && <div style={{ marginBottom: '10px', color: message.includes('succès') ? 'green' : 'red' }}>{message}</div>}
                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label>Prénom</label>
                            <input
                                type="text"
                                name="first_name"
                                value={profile.first_name}
                                onChange={handleProfileChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom</label>
                            <input
                                type="text"
                                name="last_name"
                                value={profile.last_name}
                                onChange={handleProfileChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email (lecture seule)</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                disabled
                                className="form-input"
                                style={{ backgroundColor: '#f7fafc' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Téléphone</label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                className="form-input"
                            />
                        </div>
                        <button type="submit" className="btn-update">
                            Mettre à jour le profil
                        </button>
                    </form>
                </div>

                {/* Notification Settings */}
                <div className="settings-card">
                    <h3>Notifications</h3>
                    {/* Placesholders for demo */}
                    <div className="notification-item">
                        <div className="notification-info">
                            <div>Notifications Email</div>
                            <div>Recevoir des emails pour les nouvelles réservations</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={() => handleToggle('email')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-info">
                            <div>SMS de service</div>
                            <div>Alertes SMS pour les urgences</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.sms}
                                onChange={() => handleToggle('sms')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;
