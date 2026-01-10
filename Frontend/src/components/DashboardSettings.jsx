import React, { useState } from 'react';
import '../styles/components/dashboardSettings.css';

const DashboardSettings = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        bookings: true,
        reviews: true
    });

    const [profile, setProfile] = useState({
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+222 12 34 56 78'
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="dashboard-content dashboard-settings-content">
            <h2>Settings</h2>

            <div className="settings-grid">

                {/* Profile Settings */}
                <div className="settings-card">
                    <h3>Profile Information</h3>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <button className="btn-update">
                        Update Profile
                    </button>
                </div>

                {/* Notification Settings */}
                <div className="settings-card">
                    <h3>Notifications</h3>

                    <div className="notification-item">
                        <div className="notification-info">
                            <div>Email Notifications</div>
                            <div>Receive emails about new bookings</div>
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
                            <div>SMS Notifications</div>
                            <div>Receive SMS alerts for urgent issues</div>
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

                    <div className="notification-item">
                        <div className="notification-info">
                            <div>New Bookings</div>
                            <div>Notify me when a new booking is made</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.bookings}
                                onChange={() => handleToggle('bookings')}
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
