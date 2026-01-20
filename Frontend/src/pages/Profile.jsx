import { useState, useEffect } from "react";
import { updateProfile } from "../services/authService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/pages/home.css"; // Reuse home styles for container

function Profile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            setFormData({
                first_name: u.first_name || '',
                last_name: u.last_name || '',
                phone: u.phone || ''
            });
            setPreview(u.profile_picture);
        } else {
            window.location.href = '/login';
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        try {
            const data = new FormData();
            data.append('first_name', formData.first_name);
            data.append('last_name', formData.last_name);
            data.append('phone', formData.phone);
            if (selectedFile) {
                data.append('profile_picture', selectedFile);
            }

            const response = await updateProfile(data);

            // Update local storage
            const updatedUser = response.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMsg({ type: 'success', text: 'Profil mis à jour avec succès !' });

            // Dispatch event for Header to update (if it listens) or just reload
            window.dispatchEvent(new Event('storage'));

        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="home-body">
            <Header />
            <div className="home-container" style={{ marginTop: '40px', maxWidth: '800px' }}>
                <h1 style={{ marginBottom: '30px' }}>Mon Profil</h1>

                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>

                    {msg && (
                        <div style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da',
                            color: msg.type === 'success' ? '#155724' : '#721c24'
                        }}>
                            {msg.text}
                        </div>
                    )}

                    <div style={{ position: 'relative', marginBottom: '30px' }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '4px solid #f0f0f0',
                            backgroundColor: '#eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {preview ? (
                                <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3rem', color: '#ccc' }}>
                                    {user.first_name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <label htmlFor="file-upload" style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            backgroundColor: '#1a1a1a',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '2px solid white'
                        }}>
                            <i className="fa-solid fa-camera"></i>
                        </label>
                        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Prénom</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    style={{ width: '95%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nom</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    style={{ width: '95%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Téléphone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{ width: '97%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email (non modifiable via profil)</label>
                            <input type="text" value={user.email} disabled style={{ width: '97%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', color: '#666', background: '#f9f9f9' }} />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: '#1a1a1a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                        </button>
                    </form>

                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Profile;
