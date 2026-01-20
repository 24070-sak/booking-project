import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/dashboard.css'; // Re-use some dashboard styles

function ControlCenter() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        access_control_center: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);

            if (!parsedUser.access_control_center) {
                alert("Accès refusé. Vous n'avez pas les permissions pour le Centre de Contrôle.");
                navigate('/dashboard');
            }
        } else {
            navigate('/connexion');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone,
                    access_control_center: formData.access_control_center
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Utilisateur créé avec succès !' });
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    phone: "",
                    access_control_center: false
                });
            } else {
                setMessage({ type: 'error', text: data.error || 'Une erreur est survenue' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Impossible de contacter le serveur' });
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || !currentUser.access_control_center) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>;
    }

    return (
        <div className="dashboard" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', color: '#1a1a1a', margin: 0 }}>Centre de Contrôle</h1>
                        <p style={{ color: '#666', marginTop: '5px' }}>Gestion des accès et création de comptes</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: 'white',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Retour au Dashboard
                    </button>
                </header>

                {message.text && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '25px', color: '#333' }}>Créer un nouvel utilisateur</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Prénom</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Nom</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Téléphone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Mot de passe</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <input
                                type="checkbox"
                                id="access_control_center"
                                name="access_control_center"
                                checked={formData.access_control_center}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <label htmlFor="access_control_center" style={{ fontSize: '0.9rem', color: '#444' }}>
                                Accorder la Haute Permission (Accès au Centre de Contrôle)
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '10px',
                                padding: '14px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#2563eb',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {loading ? 'Création en cours...' : 'Créer l\'utilisateur'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ControlCenter;
