import React, { useState, useEffect } from 'react';
import { getPayments } from '../services/dashboardService';
import { verifyPayment } from '../services/bookingService';
import { showError, showSuccess, showConfirm } from '../utils/alerts';
import { resolveImageUrl } from '../utils/urlHelper';
import '../styles/components/dashboardPayments.css';

const DashboardPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedPayment, setSelectedPayment] = useState(null);

    async function fetchPayments() {
        setLoading(true);
        try {
            const data = await getPayments();
            setPayments(data.payments);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleVerify = async (paymentId, action) => {
        const isConfirmed = await showConfirm(`Êtes-vous sûr de vouloir ${action === 'approve' ? 'approuver' : 'refuser'} ce paiement ?`);
        if (!isConfirmed) return;

        try {
            await verifyPayment(paymentId, action);
            showSuccess(`Paiement ${action === 'approve' ? 'approuvé' : 'refusé'} avec succès.`);
            setSelectedPayment(null);
            fetchPayments();
        } catch (error) {
            showError(error.message);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        switch (status.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'pending': return 'status-pending';
            case 'refunded': return 'status-refunded';
            case 'failed': return 'status-cancelled'; // reusing cancelled style for failed
            default: return '';
        }
    };

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'Terminé';
            case 'pending': return 'En attente';
            case 'refunded': return 'Remboursé';
            case 'failed': return 'Échoué';
            default: return status;
        }
    };

    if (loading) return <div>Chargement...</div>;

    // Calculate totals dynamically
    const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    const refundedAmount = payments
        .filter(p => p.status === 'refunded')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="dashboard-content dashboard-payments-content">
            <h2>Paiements</h2>

            <div className="payment-stats">
                <div className="payment-stat-card">
                    <h3>Revenu Total</h3>
                    <p className="text-revenue">{totalRevenue.toLocaleString()} €</p>
                </div>
                <div className="payment-stat-card">
                    <h3>En attente</h3>
                    <p className="text-pending">{pendingAmount.toLocaleString()} €</p>
                </div>
                <div className="payment-stat-card">
                    <h3>Remboursements</h3>
                    <p className="text-refunds">{refundedAmount.toLocaleString()} €</p>
                </div>
            </div>

            <div className="payments-list">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Propriété</th>
                            <th>Date</th>
                            <th>Méthode</th>
                            <th>Montant (€)</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? (
                            payments.map(payment => (
                                <tr key={payment.id}>
                                    <td data-label="ID">#{payment.id}</td>
                                    <td data-label="Guest">
                                        <div className="guest-cell">
                                            <div className="guest-avatar">
                                                {payment.guest_picture ? (
                                                    <img src={resolveImageUrl(payment.guest_picture)} alt={payment.guest_name} />
                                                ) : (
                                                    <i className="fa-solid fa-user"></i>
                                                )}
                                            </div>
                                            <span style={{ fontWeight: 'bold' }}>{payment.guest_name}</span>
                                        </div>
                                    </td>
                                    <td data-label="Property">{payment.hotel_name}</td>
                                    <td data-label="Date">{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A'}</td>
                                    <td data-label="Method">
                                        {payment.payment_method === 'credit_card' ? "Assurance (Payé à l'hôtel)" : payment.payment_method === 'local_app' ? "App Bancaire" : payment.payment_method}
                                    </td>
                                    <td data-label="Amount (€)">{payment.amount}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                            {translateStatus(payment.status)}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button className="btn-invoice" onClick={() => setSelectedPayment(payment)}>Détails</button>
                                            {payment.status === 'pending' && (
                                                <>
                                                    <button className="btn-approve" onClick={() => handleVerify(payment.id, 'approve')}>✓</button>
                                                    <button className="btn-refuse" onClick={() => handleVerify(payment.id, 'refuse')}>✕</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>Aucun paiement trouvé.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="payment-modal-overlay" onClick={() => setSelectedPayment(null)}>
                    <div className="payment-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Détails du Paiement #{selectedPayment.id}</h3>
                            <button className="modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                             <div className="modal-guest-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                <div className="modal-guest-avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(0, 98, 51, 0.1)', flexShrink: 0 }}>
                                    {selectedPayment.guest_picture ? (
                                        <img src={resolveImageUrl(selectedPayment.guest_picture)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', color: '#718096' }}>
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase' }}>Client</div>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1a202c' }}>{selectedPayment.guest_name}</div>
                                </div>
                            </div>
                            <div className="modal-info-grid">
                                <div><strong>Référence:</strong> {selectedPayment.booking_reference}</div>
                                <div><strong>Montant:</strong> {selectedPayment.amount} €</div>
                                <div><strong>Méthode:</strong> {selectedPayment.payment_method === 'credit_card' ? "Assurance (Payé à l'hôtel)" : selectedPayment.payment_method === 'local_app' ? "App Bancaire" : selectedPayment.payment_method}</div>
                                {selectedPayment.bank_app && <div><strong>App:</strong> {selectedPayment.bank_app}</div>}
                                {selectedPayment.transaction_phone && <div><strong>Tél Transaction:</strong> {selectedPayment.transaction_phone}</div>}
                            </div>

                            {selectedPayment.screenshot_url && (
                                <div className="screenshot-preview">
                                    <h4>Capture d'écran / Reçu</h4>
                                    <img
                                        src={resolveImageUrl(selectedPayment.screenshot_url)}
                                        alt="Preuve de paiement"
                                        style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            )}
                        </div>
                        {selectedPayment.status === 'pending' && (
                            <div className="modal-footer">
                                <button className="btn-full-approve" onClick={() => handleVerify(selectedPayment.id, 'approve')}>Approuver le paiement</button>
                                <button className="btn-full-refuse" onClick={() => handleVerify(selectedPayment.id, 'refuse')}>Refuser et Annuler</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPayments;
