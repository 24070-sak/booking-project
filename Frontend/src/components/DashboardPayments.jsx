import React, { useState, useEffect } from 'react';
import { getPayments } from '../services/dashboardService';
import '../styles/components/dashboardPayments.css';

const DashboardPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayments() {
            try {
                const data = await getPayments();
                setPayments(data.payments);
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPayments();
    }, []);

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
            <h2>Payments</h2>

            <div className="payment-stats">
                <div className="payment-stat-card">
                    <h3>Total Revenue</h3>
                    <p className="text-revenue">{totalRevenue.toLocaleString()} MRU</p>
                </div>
                <div className="payment-stat-card">
                    <h3>Pending</h3>
                    <p className="text-pending">{pendingAmount.toLocaleString()} MRU</p>
                </div>
                <div className="payment-stat-card">
                    <h3>Refunds</h3>
                    <p className="text-refunds">{refundedAmount.toLocaleString()} MRU</p>
                </div>
            </div>

            <div className="payments-list">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Guest</th>
                            <th>Property</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Amount (MRU)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? (
                            payments.map(payment => (
                                <tr key={payment.id}>
                                    <td data-label="ID">#{payment.id}</td>
                                    <td data-label="Guest" style={{ fontWeight: 'bold' }}>{payment.guest_name}</td>
                                    <td data-label="Property">{payment.hotel_name}</td>
                                    <td data-label="Date">{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A'}</td>
                                    <td data-label="Method">{payment.payment_method}</td>
                                    <td data-label="Amount (MRU)">{payment.amount}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <button className="btn-invoice">Invoice</button>
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
        </div>
    );
};

export default DashboardPayments;
