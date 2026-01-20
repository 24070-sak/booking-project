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

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setProfile({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
            setPreview(user.profile_picture);
        }
    }, []);

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const data = new FormData();
            data.append('first_name', profile.first_name);
            data.append('last_name', profile.last_name);
            data.append('phone', profile.phone);
            if (selectedFile) {
                data.append('profile_picture', selectedFile);
            }

            const response = await updateProfile(data);

            // Update local storage
            localStorage.setItem('user', JSON.stringify(response.user));

            setMessage('Profil mis à jour avec succès !');
            // Notify other components if needed
            window.dispatchEvent(new Event('storage'));

            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage('Erreur lors de la mise à jour : ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content dashboard-settings-content">
            <h2>Paramètres</h2>

            <div className="settings-grid">
                {/* Profile Settings */}
                <div className="settings-card">
                    <h3>Informations de Profil</h3>
                    {message && <div style={{ marginBottom: '10px', color: message.includes('succès') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</div>}

                    <form onSubmit={handleUpdateProfile}>

                        {/* Avatar Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid #eee',
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '10px'
                            }}>
                                {preview ? (
                                    <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '2rem', color: '#ccc' }}>
                                        {profile.first_name.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <label htmlFor="dashboard-file-upload" style={{ cursor: 'pointer', color: '#3182ce', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                Changer la photo
                            </label>
                            <input
                                id="dashboard-file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>

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
                                style={{ backgroundColor: '#f7fafc', color: '#718096' }}
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
                        <button type="submit" className="btn-update" disabled={loading}>
                            {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                        </button>
                    </form>
                </div>

                {/* Notification Settings */}
                <div className="settings-card">
                    <h3>Notifications</h3>
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
