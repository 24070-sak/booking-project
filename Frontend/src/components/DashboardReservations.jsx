import React, { useState, useEffect } from 'react';
import { getOwnerBookings, getAllBookings, confirmBooking, rejectBooking } from '../services/bookingService';
import { showError, showSuccess, showConfirm } from '../utils/alerts';
import '../styles/components/dashboardReservations.css';

const DashboardReservations = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function fetchBookings() {
            try {
                const storedUser = localStorage.getItem('user');
                const user = storedUser ? JSON.parse(storedUser) : null;
                const adminStatus = user?.role === 'admin';
                setIsAdmin(adminStatus);

                let data;
                if (adminStatus) {
                    data = await getAllBookings();
                } else {
                    data = await getOwnerBookings();
                }

                if (data.bookings) {
                    setBookings(data.bookings);
                }
            } catch (err) {
                console.error("Erreur chargement bookings:", err);
                setError("Impossible de charger les réservations");
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, []);

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'status-confirmed';
            case 'pending': return 'status-pending';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente (Remboursement)';
            case 'cancelled': return 'Annulé';
            case 'completed': return 'Terminé';
            default: return status;
        }
    };

    const handleAction = async (id, action) => {
        const isConfirmed = await showConfirm(`Voulez-vous vraiment ${action === 'accept' ? 'accepter' : 'refuser'} cette réservation ?`);
        if (!isConfirmed) return;
        try {
            if (action === 'accept') {
                await confirmBooking(id);
            } else {
                await rejectBooking(id);
            }
            // Refresh list
            const user = JSON.parse(localStorage.getItem('user'));
            const data = user?.role === 'admin' ? await getAllBookings() : await getOwnerBookings();
            setBookings(data.bookings || []);
            showSuccess(`Réservation ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès.`);
        } catch (err) {
            showError(err.message);
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="dashboard-content dashboard-reservations-content">
            <div style={{ marginBottom: '20px' }}>
                <h2>{isAdmin ? 'Toutes les réservations' : 'Mes Réservations'}</h2>
            </div>

            <div className="reservations-list">
                {bookings.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Référence</th>
                                {isAdmin && <th>Client réservant</th>}
                                <th>Dates</th>
                                <th>Hôtel/Chambre</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(res => (
                                <tr key={res.id}>
                                    <td data-label="ID">#{res.booking_reference}</td>
                                    {isAdmin && (
                                        <td data-label="Client" className="client-info">
                                            <div style={{ fontWeight: 'bold' }}>
                                                {res.user?.first_name} {res.user?.last_name}
                                            </div>
                                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                {res.user?.email || "Inconnu"}
                                            </div>
                                        </td>
                                    )}
                                    <td data-label="Dates">
                                        {new Date(res.check_in_date).toLocaleDateString()} - {new Date(res.check_out_date).toLocaleDateString()}
                                    </td>
                                    <td data-label="Chambre">
                                        {res.room ? (res.room.name + (res.room.hotel ? " - " + res.room.hotel.name : "")) : "Chambre inconnue"}
                                    </td>
                                    <td data-label="Total">{res.total_price} €</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${getStatusClass(res.status)}`}>
                                            {translateStatus(res.status)}
                                        </span>
                                        {res.status === 'confirmed' && (
                                            <div style={{ fontSize: '10px', color: '#059669', marginTop: '3px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                ✓ Réservation acceptée
                                            </div>
                                        )}
                                    </td>
                                    <td data-label="Actions">
                                        {res.status === 'pending' && (
                                            <div className="reservation-actions">
                                                <button
                                                    onClick={() => handleAction(res.id, 'accept')}
                                                    className="btn-action btn-accept"
                                                >Accepter</button>
                                                <button
                                                    onClick={() => handleAction(res.id, 'reject')}
                                                    className="btn-action btn-reject"
                                                >Refuser</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Aucune réservation trouvée.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardReservations;
