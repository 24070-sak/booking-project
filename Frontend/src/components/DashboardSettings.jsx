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
        phone: '',
        role: ''
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
                phone: user.phone || '',
                role: user.role || ''
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
            data.append('email', profile.email);
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
                    {message && <div className={`settings-message ${message.includes('succès') ? 'success' : 'error'}`}>{message}</div>}

                    <form onSubmit={handleUpdateProfile}>

                        {/* Avatar Section */}
                        <div className="avatar-section">
                            <div className="avatar-container">
                                {preview ? (
                                    <img src={preview} alt="Avatar" />
                                ) : (
                                    <span className="avatar-placeholder">
                                        <i className="fa-solid fa-user"></i>
                                    </span>
                                )}
                            </div>
                            <label htmlFor="dashboard-file-upload" className="avatar-upload-label">
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

                        {profile.role === 'manager' || profile.role === 'admin' ? (
                            <div className="form-group">
                                <label>{profile.role === 'manager' ? "Nom de l'hôtel" : "Nom de l'administration"}</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={profile.first_name}
                                    onChange={handleProfileChange}
                                    className="form-input"
                                    required
                                />
                                <input type="hidden" name="last_name" value="" />
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                disabled={profile.role !== 'admin' && profile.role !== 'manager'}
                                className="form-input"
                                style={{ 
                                    backgroundColor: profile.role === 'admin' || profile.role === 'manager' ? '#fff' : '#f7fafc', 
                                    color: profile.role === 'admin' || profile.role === 'manager' ? '#333' : '#718096' 
                                }}
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

            </div>
        </div>
    );
};

export default DashboardSettings;
