import React, { useState, useEffect } from 'react';
import { getOwnerBookings, getAllBookings, confirmBooking, rejectBooking, verifyPayment } from '../services/bookingService';
import { getPayments } from '../services/dashboardService';
import { showError, showSuccess, showConfirm } from '../utils/alerts';
import { useNotification } from '../context/NotificationContext';
import { resolveImageUrl } from '../utils/urlHelper';
import '../styles/components/dashboardReservations.css';

const DashboardReservations = ({ targetBookingId, targetPaymentId, initialTab }) => {
    const { notifications, markByTypeAsRead } = useNotification();
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab || 'bookings');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (activeTab === 'payments') {
            markByTypeAsRead('payment');
        } else if (activeTab === 'bookings') {
            markByTypeAsRead('booking');
        }
    }, [activeTab]);

    useEffect(() => {
        fetchAll(true);
    }, []);

    async function fetchAll(showLoader = false) {
        if (showLoader) setLoading(true);
        else setRefreshing(true);
        try {
            const storedUser = localStorage.getItem('user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            // Both admin and manager see all bookings (filtered server-side by hotel ownership)
            const isFullAccess = user?.role === 'admin' || user?.role === 'manager';

            const [bookingsData, paymentsData] = await Promise.all([
                isFullAccess ? getAllBookings() : getOwnerBookings(),
                getPayments()
            ]);

            setBookings(bookingsData.bookings || []);
            setPayments(paymentsData.payments || []);
        } catch (err) {
            console.error("Erreur chargement:", err);
            setError("Impossible de charger les données");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    // Auto-select booking or payment if ID is provided
    useEffect(() => {
        if (!loading && bookings.length > 0) {
            if (targetBookingId) {
                const booking = bookings.find(b => b.id === Number(targetBookingId));
                if (booking) {
                    setSelectedBooking(booking);
                    setActiveTab('bookings');
                }
            } else if (targetPaymentId) {
                const payment = payments.find(p => p.id === Number(targetPaymentId) || p.transaction_id === targetPaymentId);
                if (payment) {
                    setSelectedPayment(payment);
                    setActiveTab('payments');
                }
            }
        }
    }, [loading, bookings, payments, targetBookingId, targetPaymentId]);

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'status-confirmed';
            case 'pending': return 'status-pending';
            case 'cancelled': return 'status-cancelled';
            case 'completed': return 'status-completed';
            default: return '';
        }
    };

    const translateBookingStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            case 'completed': return 'Terminé';
            default: return status;
        }
    };

    const translatePaymentStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'Accepté';
            case 'pending': return 'En attente';
            case 'refunded': return 'Remboursé';
            case 'failed': return 'Refusé';
            default: return status;
        }
    };

    const handleBookingAction = async (id, action) => {
        const confirmed = await showConfirm(
            `Voulez-vous vraiment ${action === 'accept' ? 'accepter' : 'refuser'} cette réservation ?`
        );
        if (!confirmed) return;
        try {
            // Confirm or reject the booking itself
            if (action === 'accept') {
                await confirmBooking(id);
                // Auto-approve the attached payment if it exists and is pending
                const booking = bookings.find(b => b.id === id);
                if (booking?.payment?.id && booking.payment.status === 'pending') {
                    await verifyPayment(booking.payment.id, 'approve');
                }
            } else {
                await rejectBooking(id);
                // Auto-refuse the attached payment if it exists and is pending
                const booking = bookings.find(b => b.id === id);
                if (booking?.payment?.id && booking.payment.status === 'pending') {
                    await verifyPayment(booking.payment.id, 'refuse');
                }
            }
            // Re-fetch everything so both tabs update live
            await fetchAll();
            showSuccess(`Réservation ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès.`);
        } catch (err) {
            showError(err.message);
        }
    };

    const handleVerifyPayment = async (paymentId, action) => {
        const confirmed = await showConfirm(
            `Êtes-vous sûr de vouloir ${action === 'approve' ? 'approuver' : 'refuser'} ce paiement ?`
        );
        if (!confirmed) return;
        try {
            await verifyPayment(paymentId, action);
            showSuccess(`Paiement ${action === 'approve' ? 'approuvé' : 'refusé'} avec succès.`);
            setSelectedPayment(null);
            await fetchAll();
        } catch (err) {
            showError(err.message);
        }
    };

    // Stats - Using booking status instead of payment status for calculated amounts
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
    const pendingAmount = bookings
        .filter(b => b.status === 'pending')
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    // Counts
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}><i className="fa-solid fa-spinner fa-spin"></i> Chargement...</div>;
    if (error) return <div style={{ padding: '20px', color: '#dc2626' }}>{error}</div>;

    return (
        <div className="dashboard-content dashboard-reservations-content">
            <h2>Réservations & Paiements</h2>
            {refreshing && (
                <div style={{ marginBottom: '12px', padding: '8px 14px', background: 'rgba(0,98,51,0.06)', borderRadius: '6px', fontSize: '12px', color: 'var(--primary-green, #006233)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Actualisation des données...
                </div>
            )}

            {/* Stats */}
            <div className="reservations-stats">
                <div className="stat-card">
                    <div className="stat-card-icon icon-total">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div>
                        <h3>Total</h3>
                        <p>{bookings.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon icon-pending">
                        <i className="fa-solid fa-clock"></i>
                    </div>
                    <div>
                        <h3>En Attente</h3>
                        <p>{pendingBookings}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon icon-confirmed">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                        <h3>Confirmées</h3>
                        <p>{confirmedBookings}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon icon-revenue">
                        <i className="fa-solid fa-coins"></i>
                    </div>
                    <div className="stat-card-content">
                        <h3>Revenu</h3>
                        <p>{totalRevenue.toLocaleString('fr-FR')} €</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="reservations-tabs">
                <button
                    className={`reservations-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <i className="fa-solid fa-book"></i>
                    Réservations
                    {notifications.filter(n => !n.is_read && n.type === 'booking').length > 0 && (
                        <span className="tab-badge">
                            {notifications.filter(n => !n.is_read && n.type === 'booking').length}
                        </span>
                    )}
                </button>
                <button
                    className={`reservations-tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    <i className="fa-solid fa-credit-card"></i>
                    Paiements
                    {notifications.filter(n => !n.is_read && n.type === 'payment').length > 0 && (
                        <span className="tab-badge">
                            {notifications.filter(n => !n.is_read && n.type === 'payment').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="reservations-table-wrap table-responsive">
                    {bookings.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Client</th>
                                    <th>Dates</th>
                                    <th>Chambre</th>
                                    <th>Montant</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(res => (
                                    <tr key={res.id}>
                                        <td data-label="Réf">
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-green, #006233)' }}>
                                                #{res.booking_reference}
                                            </span>
                                        </td>
                                        <td data-label="Client">
                                            <div className="client-cell">
                                                <div className="client-avatar-wrap">
                                                    {res.user?.profile_picture ? (
                                                        <img 
                                                            src={resolveImageUrl(res.user.profile_picture)} 
                                                            alt={`${res.user?.first_name} ${res.user?.last_name}`}
                                                            className="client-avatar-img"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className="client-avatar" style={{ display: res.user?.profile_picture ? 'none' : 'flex' }}>
                                                        {res.user?.first_name?.[0]}{res.user?.last_name?.[0]}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="client-name">{res.user?.first_name} {res.user?.last_name}</div>
                                                    <div className="client-email">{res.user?.email || "Inconnu"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Dates">
                                            <div className="dates-cell">
                                                <span>{new Date(res.check_in_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                                <i className="fa-solid fa-arrow-right arrow"></i>
                                                <span>{new Date(res.check_out_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        </td>
                                        <td data-label="Chambre">
                                            <span className="room-name">{res.room?.name || 'Inconnue'}</span>
                                            {res.room?.hotel && <span className="hotel-name">{res.room.hotel.name}</span>}
                                        </td>
                                        <td data-label="Montant">
                                            <span className="amount-value">{res.total_price} €</span>
                                        </td>
                                        <td data-label="Actions">
                                            {res.status === 'pending' ? (
                                                <div className="action-buttons">
                                                    <button onClick={() => handleBookingAction(res.id, 'accept')} className="btn-action-sm btn-accept" title="Accepter">
                                                        <i className="fa-solid fa-check"></i>
                                                    </button>
                                                    <button onClick={() => handleBookingAction(res.id, 'reject')} className="btn-action-sm btn-reject" title="Refuser">
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                    <button onClick={() => setSelectedBooking(res)} className="btn-action-sm btn-details" title="Détails">
                                                        <i className="fa-solid fa-eye"></i>
                                                    </button>
                                                </div>
                                            ) : res.status === 'confirmed' ? (
                                                <span className="status-badge status-confirmed">Confirmé</span>
                                            ) : (
                                                <span className="status-badge status-cancelled">Annulé</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <i className="fa-regular fa-calendar-xmark"></i>
                            <p>Aucune réservation trouvée.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <>
                    <div className="payment-summary">
                        <div className="summary-card revenue">
                            <div className="summary-content">
                                <span className="summary-label"><i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }}></i>Revenu Total (Paiements Acceptés)</span>
                                <span className="summary-value">{totalRevenue.toLocaleString('fr-FR')} €</span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#718096' }}>
                                {bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length} réservation(s) acceptée(s)
                            </span>
                        </div>
                        <div className="summary-card pending">
                            <div className="summary-content">
                                <span className="summary-label"><i className="fa-solid fa-clock" style={{ marginRight: '5px' }}></i>Solde en Attente</span>
                                <span className="summary-value">{pendingAmount.toLocaleString('fr-FR')} €</span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#718096' }}>
                                {bookings.filter(b => b.status === 'pending').length} réservation(s) en attente
                            </span>
                        </div>
                    </div>

                    <div className="payments-list-premium">
                        <h4 className="payments-list-title">
                            <i className="fa-solid fa-list-check"></i> Historique des Transactions
                        </h4>
                        {payments.length > 0 ? (
                            payments.map(payment => (
                                <div className={`payment-card-premium ${payment.status}`} key={payment.id}>
                                    <div className="payment-card-left">
                                        <div className={`payment-icon-circle ${payment.status}`}>
                                            <i className={`fa-solid ${payment.status === 'completed' ? 'fa-check' : payment.status === 'pending' ? 'fa-clock' : 'fa-xmark'}`}></i>
                                        </div>
                                        <div className="payment-card-info">
                                            <span className="payment-card-txn">
                                                {payment.transaction_id || `PAY-${String(payment.id).padStart(5, '0')}`}
                                            </span>
                                            <span className="payment-card-client">{payment.guest_name}</span>
                                            <span className="payment-card-hotel">{payment.hotel_name}</span>
                                        </div>
                                    </div>
                                    <div className="payment-card-center">
                                        <span className="payment-card-method">
                                            <i className={`fa-solid ${payment.payment_method === 'credit_card' ? 'fa-credit-card' : 'fa-mobile-screen-button'}`} style={{ marginRight: '5px' }}></i>
                                            {payment.payment_method === 'credit_card'
                                                ? "Assurance (à l'hôtel)"
                                                : payment.payment_method === 'local_app'
                                                    ? `${payment.bank_app || 'App Locale'}`
                                                    : payment.payment_method}
                                        </span>
                                        <span className="payment-card-date">
                                            <i className="fa-regular fa-calendar" style={{ marginRight: '4px' }}></i>
                                            {(payment.paid_at || payment.created_at) ? new Date(payment.paid_at || payment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                                        </span>
                                    </div>
                                    <div className="payment-card-right">
                                        <span className="payment-card-amount">{Number(payment.amount).toLocaleString('fr-FR')} €</span>
                                        <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                            {translatePaymentStatus(payment.status)}
                                        </span>
                                    </div>
                                    <div className="payment-card-actions">
                                        <button className="btn-action-sm btn-details" onClick={() => setSelectedPayment(payment)} title="Détails">
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                        {payment.status === 'pending' && (
                                            <>
                                                <button className="btn-action-sm btn-accept" onClick={() => handleVerifyPayment(payment.id, 'approve')} title="Approuver">
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                                <button className="btn-action-sm btn-reject" onClick={() => handleVerifyPayment(payment.id, 'refuse')} title="Refuser">
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="fa-regular fa-credit-card"></i>
                                <p>Aucun paiement trouvé.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Payment Detail Modal */}
            {selectedPayment && (
                <div className="reservation-modal-overlay" onClick={() => setSelectedPayment(null)}>
                    <div className="reservation-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><i className="fa-solid fa-receipt"></i> Détails du Paiement</h3>
                            <button className="modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-info-grid">
                                <div className="modal-field">
                                    <label>Transaction ID</label>
                                    <span className="transaction-id-badge">
                                        {selectedPayment.transaction_id || `PAY-${String(selectedPayment.id).padStart(5, '0')}`}
                                    </span>
                                </div>
                                <div className="modal-field">
                                    <label>Client</label>
                                    <span>{selectedPayment.guest_name}</span>
                                </div>
                                <div className="modal-field">
                                    <label>Réf. Réservation</label>
                                    <span>#{selectedPayment.booking_reference}</span>
                                </div>
                                <div className="modal-field">
                                    <label>Montant</label>
                                    <span className="amount-value">{selectedPayment.amount} €</span>
                                </div>
                                <div className="modal-field">
                                    <label>Méthode</label>
                                    <span>
                                        {selectedPayment.payment_method === 'credit_card'
                                            ? "Assurance (Payé à l'hôtel)"
                                            : selectedPayment.payment_method === 'local_app'
                                                ? "Application Bancaire"
                                                : selectedPayment.payment_method}
                                    </span>
                                </div>
                                <div className="modal-field">
                                    <label>Statut</label>
                                    <span className={`status-badge ${getStatusClass(selectedPayment.status)}`}>
                                        {translatePaymentStatus(selectedPayment.status)}
                                    </span>
                                </div>
                                {selectedPayment.bank_app && (
                                    <div className="modal-field">
                                        <label>Application</label>
                                        <span>{selectedPayment.bank_app}</span>
                                    </div>
                                )}
                                {selectedPayment.transaction_phone && (
                                    <div className="modal-field">
                                        <label>Tél. Transaction</label>
                                        <span>{selectedPayment.transaction_phone}</span>
                                    </div>
                                )}
                            </div>

                            {selectedPayment.screenshot_url && (
                                <div className="screenshot-section">
                                    <h4><i className="fa-solid fa-image"></i> Preuve de paiement</h4>
                                    <a href={`http://127.0.0.1:5000${selectedPayment.screenshot_url}`} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={`http://127.0.0.1:5000${selectedPayment.screenshot_url}`}
                                            alt="Reçu de paiement"
                                            className="screenshot-img"
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                        {selectedPayment.status === 'pending' && (
                            <div className="modal-footer">
                                <button className="btn-modal-approve" onClick={() => handleVerifyPayment(selectedPayment.id, 'approve')}>
                                    <i className="fa-solid fa-check"></i> Approuver le paiement
                                </button>
                                <button className="btn-modal-refuse" onClick={() => handleVerifyPayment(selectedPayment.id, 'refuse')}>
                                    <i className="fa-solid fa-xmark"></i> Refuser
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="reservation-modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="reservation-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><i className="fa-solid fa-info-circle"></i> Détails de la réservation #{selectedBooking.booking_reference}</h3>
                            <button className="modal-close" onClick={() => setSelectedBooking(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {/* User Info */}
                            <div className="modal-user-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                                <div className="modal-user-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(0, 98, 51, 0.15)', flexShrink: 0 }}>
                                    {selectedBooking.user?.profile_picture ? (
                                        <img src={resolveImageUrl(selectedBooking.user.profile_picture)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="client-avatar" style={{ width: '100%', height: '100%', borderRadius: '0', fontSize: '20px' }}>
                                            {selectedBooking.user?.first_name?.[0]}{selectedBooking.user?.last_name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-info-grid" style={{ marginBottom: '0', flex: 1 }}>
                                    <div className="modal-field">
                                        <label>Nom</label>
                                        <span>{selectedBooking.user?.first_name} {selectedBooking.user?.last_name}</span>
                                    </div>
                                    <div className="modal-field">
                                        <label>Email</label>
                                        <span>{selectedBooking.user?.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-info-grid">
                                <div className="modal-field">
                                    <label>Nb de personnes</label>
                                    <span>{selectedBooking.num_guests}</span>
                                </div>
                                {selectedBooking.special_requests && (
                                    <div className="modal-field" style={{ gridColumn: '1 / -1' }}>
                                        <label>Demandes spéciales</label>
                                        <span>{selectedBooking.special_requests}</span>
                                    </div>
                                )}
                            </div>

                            {/* Room Info */}
                            <h4 style={{ color: 'var(--primary-green, #006233)', margin: '20px 0 12px 0', fontSize: '14px' }}>
                                <i className="fa-solid fa-bed"></i> Chambre & Séjour
                            </h4>
                            <div className="modal-info-grid">
                                <div className="modal-field">
                                    <label>Chambre</label>
                                    <span>{selectedBooking.room?.name || 'Inconnue'}</span>
                                </div>
                                <div className="modal-field">
                                    <label>Hôtel</label>
                                    <span>{selectedBooking.room?.hotel?.name || 'Inconnu'}</span>
                                </div>
                                <div className="modal-field">
                                    <label>Check-in</label>
                                    <span>{new Date(selectedBooking.check_in_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="modal-field">
                                    <label>Check-out</label>
                                    <span>{new Date(selectedBooking.check_out_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="modal-field">
                                    <label>Nuits</label>
                                    <span>{selectedBooking.num_nights}</span>
                                </div>
                                <div className="modal-field">
                                    <label>Montant Total</label>
                                    <span className="amount-value">{selectedBooking.total_price} €</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <h4 style={{ color: 'var(--primary-green, #006233)', margin: '20px 0 12px 0', fontSize: '14px' }}>
                                <i className="fa-solid fa-credit-card"></i> Paiement
                            </h4>
                            {!selectedBooking.payment ? (
                                <p style={{ color: '#718096', fontSize: '13px' }}>Aucun paiement soumis pour le moment.</p>
                            ) : (
                                <>
                                    <div className="modal-info-grid">
                                        <div className="modal-field">
                                            <label>Méthode</label>
                                            <span>
                                                {selectedBooking.payment.payment_method === 'credit_card'
                                                    ? "Assurance (Payé à l'hôtel)"
                                                    : selectedBooking.payment.payment_method === 'local_app'
                                                        ? `App Bancaire (${selectedBooking.payment.bank_app || 'Locale'})`
                                                        : selectedBooking.payment.payment_method}
                                            </span>
                                        </div>
                                        <div className="modal-field">
                                            <label>Montant Payé</label>
                                            <span className="amount-value">{selectedBooking.payment.amount} €</span>
                                        </div>
                                        <div className="modal-field">
                                            <label>Statut Paiement</label>
                                            <span className={`status-badge ${getStatusClass(selectedBooking.payment.status)}`}>
                                                {translatePaymentStatus(selectedBooking.payment.status)}
                                            </span>
                                        </div>
                                        {selectedBooking.payment.transaction_id && (
                                            <div className="modal-field">
                                                <label>Transaction ID</label>
                                                <span className="transaction-id-badge">{selectedBooking.payment.transaction_id}</span>
                                            </div>
                                        )}
                                        {selectedBooking.payment.transaction_phone && (
                                            <div className="modal-field">
                                                <label>Tél. Transaction</label>
                                                <span>{selectedBooking.payment.transaction_phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedBooking.payment.screenshot_url && (
                                        <div className="screenshot-section">
                                            <h4><i className="fa-solid fa-image"></i> Preuve de paiement</h4>
                                            <a href={`http://127.0.0.1:5000${selectedBooking.payment.screenshot_url}`} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={`http://127.0.0.1:5000${selectedBooking.payment.screenshot_url}`}
                                                    alt="Reçu de paiement"
                                                    className="screenshot-img"
                                                />
                                            </a>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {selectedBooking.status === 'pending' && (
                            <div className="modal-footer">
                                <button className="btn-modal-approve" onClick={() => { setSelectedBooking(null); handleBookingAction(selectedBooking.id, 'accept'); }}>
                                    <i className="fa-solid fa-check"></i> Accepter
                                </button>
                                <button className="btn-modal-refuse" onClick={() => { setSelectedBooking(null); handleBookingAction(selectedBooking.id, 'reject'); }}>
                                    <i className="fa-solid fa-xmark"></i> Refuser
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardReservations;
