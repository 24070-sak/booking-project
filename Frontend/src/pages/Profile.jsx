import { useState, useEffect } from "react";
import { updateProfile } from "../services/authService";
import { Link } from "react-router-dom";
import "../styles/pages/home.css"; // Reuse home styles for container

function Profile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
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
                email: u.email || '',
                phone: u.phone || ''
            });
            setPreview(u.profile_picture);
        } else {
            window.location.href = '/connexion';
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
            data.append('email', formData.email);
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
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Modern Back Button Header */}
            <div style={{ 
                width: '100%', 
                maxWidth: '800px', 
                display: 'flex', 
                justifyContent: 'flex-start',
                marginBottom: '30px',
                padding: '20px 0'
            }}>
                <Link to="/" style={{ 
                    textDecoration: 'none', 
                    color: '#4b5563', 
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '10px 20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    border: '1px solid #e5e7eb'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.transform = 'translateX(-4px)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a1a1a'
                    }}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </div>
                    Retour à l'accueil
                </Link>
            </div>
            
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <h1 style={{ marginBottom: '30px', color: '#1a1a1a' }}>Mon Profil</h1>

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
                            backgroundColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {preview && preview !== 'null' && preview !== 'undefined' ? (
                                <>
                                    <img 
                                        src={preview} 
                                        alt="" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'inline-block';
                                        }}
                                    />
                                    <span style={{ fontSize: '3rem', color: '#ccc', display: 'none' }}>
                                        <i className="fa-solid fa-user"></i>
                                    </span>
                                </>
                            ) : (
                                <span style={{ fontSize: '3rem', color: '#ccc' }}>
                                    <i className="fa-solid fa-user"></i>
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
                        {user.role === 'manager' || user.role === 'admin' ? (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    {user.role === 'manager' ? "Nom de l'hôtel" : "Nom de l'administration"}
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    style={{ width: '97%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                                {/* last_name hidden but kept for consistency */}
                                <input type="hidden" name="last_name" value="" />
                            </div>
                        ) : (
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
                        )}

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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email} 
                                onChange={handleChange}
                                disabled={user.role !== 'admin' && user.role !== 'manager'} 
                                style={{ 
                                    width: '97%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: user.role === 'admin' || user.role === 'manager' ? '1px solid #ddd' : '1px solid #eee',
                                    color: user.role === 'admin' || user.role === 'manager' ? '#333' : '#666', 
                                    background: user.role === 'admin' || user.role === 'manager' ? '#fff' : '#f9f9f9' 
                                }} 
                            />
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
        </div>
    );
}

export default Profile;
