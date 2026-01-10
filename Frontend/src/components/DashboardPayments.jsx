import React from 'react';
import { paymentsData, propertiesData } from '../data/mockData';
import '../styles/components/dashboardPayments.css';

const DashboardPayments = () => {
    const getPropertyName = (id) => {
        const prop = propertiesData.find(p => p.id === id);
        return prop ? prop.name : 'Unknown Property';
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'pending': return 'status-pending';
            case 'refunded': return 'status-refunded';
            default: return '';
        }
    };

    return (
        <div className="dashboard-content dashboard-payments-content">
            <h2>Payments</h2>

            <div className="payment-stats">
                <div className="payment-stat-card">
                    <h3>Total Revenue</h3>
                    <p className="text-revenue">33,800 MRU</p>
                </div>
                <div className="payment-stat-card">
                    <h3>Pending</h3>
                    <p className="text-pending">5,000 MRU</p>
                </div>
                <div className="payment-stat-card">
                    <h3>Refunds</h3>
                    <p className="text-refunds">4,800 MRU</p>
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
                        {paymentsData.map(payment => (
                            <tr key={payment.id}>
                                <td data-label="ID">#{payment.id}</td>
                                <td data-label="Guest" style={{ fontWeight: 'bold' }}>{payment.guest}</td>
                                <td data-label="Property">{getPropertyName(payment.propertyId)}</td>
                                <td data-label="Date">{payment.date}</td>
                                <td data-label="Method">{payment.method}</td>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardPayments;
