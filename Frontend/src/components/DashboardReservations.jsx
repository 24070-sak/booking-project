import React, { useState, useEffect } from 'react';
import { getOwnerBookings, getAllBookings } from '../services/bookingService';
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
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            case 'completed': return 'Terminé';
            default: return status;
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
                                    <td data-label="Total">{res.total_price} MRU</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${getStatusClass(res.status)}`}>
                                            {translateStatus(res.status)}
                                        </span>
                                        {res.status === 'confirmed' && (
                                            <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 'bold' }}>
                                                L'administrateur a accepté votre réservation.
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
