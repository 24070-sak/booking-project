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

    // Manage Users State
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);

            if (!parsedUser.access_control_center) {
                alert("Accès refusé. Vous n'avez pas les permissions pour le Centre de Contrôle.");
                navigate('/dashboard');
            } else {
                fetchUsers();
            }
        } else {
            navigate('/connexion');
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

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
            const response = await fetch(`${API_URL}/auth/admin/create-user`, {
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
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: data.error || 'Une erreur est survenue' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Impossible de contacter le serveur' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Utilisateur supprimé avec succès.' });
                setUsers(users.filter(u => u.id !== id));
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur réseau.' });
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingUser({ ...editingUser, [name]: value });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: editingUser.email,
                    first_name: editingUser.first_name,
                    phone: editingUser.phone,
                    password: editingUser.password || undefined // Only update if provided
                })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Utilisateur mis à jour avec succès.' });
                setEditingUser(null);
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur réseau.' });
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

                <div className="control-center-card" style={{ marginTop: '30px' }}>
                    <h2>Liste des Managers</h2>
                    {loadingUsers ? (
                        <p>Chargement des utilisateurs...</p>
                    ) : (
                        <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f7f3', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Nom / Hôtel</th>
                                    <th style={{ padding: '10px' }}>Email</th>
                                    <th style={{ padding: '10px' }}>Téléphone</th>
                                    <th style={{ padding: '10px' }}>Rôle</th>
                                    <th style={{ padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>{u.first_name} {u.last_name}</td>
                                        <td style={{ padding: '10px' }}>{u.email}</td>
                                        <td style={{ padding: '10px' }}>{u.phone || 'N/A'}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                backgroundColor: u.role === 'admin' ? '#e2e8f0' : '#dcfce7',
                                                color: u.role === 'admin' ? '#475569' : '#166534',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => setEditingUser({ ...u, password: '' })}
                                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Éditer
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                disabled={u.id === currentUser.id}
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Edit Modal */}
                {editingUser && (
                    <div className="control-center-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="control-center-modal" style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                            <h2>Éditer Manager</h2>
                            <form onSubmit={handleUpdateUser} className="control-center-form" style={{ marginTop: '20px' }}>
                                <div className="form-field">
                                    <label>Nom ou Hôtel</label>
                                    <input type="text" name="first_name" value={editingUser.first_name} onChange={handleEditChange} required />
                                </div>
                                <div className="form-field">
                                    <label>Email</label>
                                    <input type="email" name="email" value={editingUser.email} onChange={handleEditChange} required />
                                </div>
                                <div className="form-field">
                                    <label>Téléphone</label>
                                    <input type="text" name="phone" value={editingUser.phone} onChange={handleEditChange} />
                                </div>
                                <div className="form-field">
                                    <label>Nouveau Mot de passe (Laissez vide pour ne pas changer)</label>
                                    <input type="password" name="password" value={editingUser.password} onChange={handleEditChange} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" className="btn-submit-user" style={{ flex: 1 }}>Enregistrer</button>
                                    <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, backgroundColor: '#cbd5e1', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ControlCenter;
