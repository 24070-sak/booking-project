import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/controlCenter.css';

function ControlCenter() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        hotelName: "",
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
                    first_name: formData.hotelName, // Envoi du nom de l'hôtel en tant que 'first_name'
                    last_name: "",                  // 'last_name' laissé vide
                    phone: formData.phone,
                    access_control_center: formData.access_control_center
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Utilisateur créé avec succès !' });
                setFormData({
                    hotelName: "",
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
        return <div className="control-center-loading">Chargement...</div>;
    }

    return (
        <div className="control-center-page">
            <div className="control-center-container">
                <header className="control-center-header">
                    <div className="control-center-title-section">
                        <h1>Centre de Contrôle</h1>
                        <p>Gestion des accès et création de comptes</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-back-dashboard"
                    >
                        Retour au Dashboard
                    </button>
                </header>

                {message.text && (
                    <div className={`control-center-alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="control-center-card">
                    <h2>Créer un nouvel utilisateur</h2>

                    <form onSubmit={handleSubmit} className="control-center-form">
                        <div className="form-row">
                            <div className="form-field" style={{ width: '100%' }}>
                                <label>Nom de l'hôtel</label>
                                <input
                                    type="text"
                                    name="hotelName"
                                    placeholder="Ex: Hôtel de la Paix"
                                    value={formData.hotelName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="hotel@exemple.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Téléphone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="+222 12 34 56 78"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-field">
                                <label>Mot de passe</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Mot de passe sécurisé"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="permission-checkbox">
                            <input
                                type="checkbox"
                                id="access_control_center"
                                name="access_control_center"
                                checked={formData.access_control_center}
                                onChange={handleChange}
                            />
                            <label htmlFor="access_control_center">
                                Accorder la Haute Permission (Accès au Centre de Contrôle)
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-submit-user"
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
