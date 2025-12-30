import React, { useState } from 'react';

export default function Settings() {
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('(GMT+00:00) UTC');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = () => {
    alert('Changes saved successfully!');
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
                <label style={styles.label}>Full Name</label>
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
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
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