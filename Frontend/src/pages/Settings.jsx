import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  
  const { settings, updateSettings } = useNotification();

  const [fullName, setFullName] = useState(user?.first_name + (user?.last_name ? ' ' + user.last_name : '') || 'John Doe');
  const [email, setEmail] = useState(user?.email || 'john.doe@example.com');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('(GMT+00:00) UTC');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [notifState, setNotifState] = useState({
    notify_messages: true,
    notify_bookings: true,
    notify_payments: true,
    sound_enabled: true
  });

  useEffect(() => {
    if (settings) {
      setNotifState(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    // Save notification settings to backend
    await updateSettings(notifState);
    alert('Changes saved successfully!');
  };

  const getLabel = () => {
    if (user?.role === 'manager') return "Nom de l'hôtel";
    if (user?.role === 'admin') return "Nom de l'administration";
    return 'Full Name';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '32px',
    },
    card: {
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '32px',
    },
    title: {
      fontSize: '30px',
      fontWeight: 'bold',
      marginBottom: '32px',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '24px',
    },
    section: {
      marginBottom: '32px',
    },
    profileContainer: {
      display: 'flex',
      gap: '32px',
      marginBottom: '24px',
    },
    avatarSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      width: '128px',
      height: '128px',
      backgroundColor: '#e5e7eb',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px',
      fontSize: '64px',
    },
    avatarText: {
      fontSize: '14px',
      color: '#6b7280',
    },
    formSection: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      backgroundColor: 'white',
      color: 'black',
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    select: {
      width: '100%',
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      backgroundColor: 'white',
      color: 'black',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '12px 32px',
      backgroundColor: '#2563eb',
      color: 'white',
      fontWeight: '500',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
    },
    toggleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '12px',
      border: '1px solid #e5e7eb'
    },
    toggleLabel: {
      fontSize: '15px',
      fontWeight: '500',
      color: '#374151'
    },
    switch: {
      position: 'relative',
      display: 'inline-block',
      width: '44px',
      height: '24px',
    },
    slider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ccc',
      transition: '.4s',
      borderRadius: '24px',
    },
    sliderBefore: {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '3px',
      bottom: '3px',
      backgroundColor: 'white',
      transition: '.4s',
      borderRadius: '50%',
    }
  };

  const handleToggle = (key) => {
    setNotifState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Settings</h1>

        {/* Profile Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile</h2>

          <div style={styles.profileContainer}>
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                <span>👤</span>
              </div>
              <p style={styles.avatarText}>JPG, GIF or PNG.</p>
              <p style={styles.avatarText}>10 MB max</p>
            </div>

            <div style={styles.formSection}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>{getLabel()}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={email}
                  disabled={user?.role !== 'admin' && user?.role !== 'manager'}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    ...styles.input, 
                    backgroundColor: user?.role === 'admin' || user?.role === 'manager' ? 'white' : '#f3f4f6', 
                    cursor: user?.role === 'admin' || user?.role === 'manager' ? 'text' : 'not-allowed' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Account</h2>

          <div style={styles.gridContainer}>
            <div>
              <label style={styles.label}>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={styles.select}
              >
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
                <option>German</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Time Zone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={styles.select}
              >
                <option>(GMT+00:00) UTC</option>
                <option>(GMT+01:00) Paris</option>
                <option>(GMT-05:00) New York</option>
                <option>(GMT-08:00) Los Angeles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Security</h2>

          <div style={styles.gridContainer}>
            <div>
              <label style={styles.label}>Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Notifications</h2>

          <div style={styles.toggleContainer}>
            <span style={styles.toggleLabel}>Messages notifications</span>
            <div 
              style={{...styles.switch, backgroundColor: notifState.notify_messages ? '#006233' : '#ccc', borderRadius: '24px', cursor: 'pointer', transition: '.4s'}} 
              onClick={() => handleToggle('notify_messages')}
            >
              <div style={{...styles.sliderBefore, transform: notifState.notify_messages ? 'translateX(20px)' : 'translateX(0)'}} />
            </div>
          </div>

          <div style={styles.toggleContainer}>
            <span style={styles.toggleLabel}>Reservations notifications</span>
            <div 
              style={{...styles.switch, backgroundColor: notifState.notify_bookings ? '#006233' : '#ccc', borderRadius: '24px', cursor: 'pointer', transition: '.4s'}} 
              onClick={() => handleToggle('notify_bookings')}
            >
              <div style={{...styles.sliderBefore, transform: notifState.notify_bookings ? 'translateX(20px)' : 'translateX(0)'}} />
            </div>
          </div>

          <div style={styles.toggleContainer}>
            <span style={styles.toggleLabel}>Payments notifications</span>
            <div 
              style={{...styles.switch, backgroundColor: notifState.notify_payments ? '#006233' : '#ccc', borderRadius: '24px', cursor: 'pointer', transition: '.4s'}} 
              onClick={() => handleToggle('notify_payments')}
            >
              <div style={{...styles.sliderBefore, transform: notifState.notify_payments ? 'translateX(20px)' : 'translateX(0)'}} />
            </div>
          </div>

          <div style={styles.toggleContainer}>
            <span style={styles.toggleLabel}>Sound alerts</span>
            <div 
              style={{...styles.switch, backgroundColor: notifState.sound_enabled ? '#006233' : '#ccc', borderRadius: '24px', cursor: 'pointer', transition: '.4s'}} 
              onClick={() => handleToggle('sound_enabled')}
            >
              <div style={{...styles.sliderBefore, transform: notifState.sound_enabled ? 'translateX(20px)' : 'translateX(0)'}} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={styles.buttonContainer}>
          <button
            onClick={handleSave}
            style={styles.button}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}