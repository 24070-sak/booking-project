import React from 'react';
import { reservationsData, propertiesData } from '../data/mockData';
import '../styles/components/dashboardReservations.css';

const DashboardReservations = () => {
    // Helper to get property name
    const getPropertyName = (id) => {
        const prop = propertiesData.find(p => p.id === id);
        return prop ? prop.name : 'Unknown Property';
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'status-confirmed';
            case 'pending': return 'status-pending';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    return (
        <div className="dashboard-content dashboard-reservations-content">
            <div style={{ marginBottom: '20px' }}>
                <h2>Reservations</h2>
            </div>

            <div className="reservations-list">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Guest</th>
                            <th>Property</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                            <th>Total (MRU)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservationsData.map(res => (
                            <tr key={res.id}>
                                <td data-label="ID">#{res.id}</td>
                                <td data-label="Guest" style={{ fontWeight: 'bold' }}>{res.guestName}</td>
                                <td data-label="Property">{getPropertyName(res.propertyId)}</td>
                                <td data-label="Check-In">{res.checkIn}</td>
                                <td data-label="Check-Out">{res.checkOut}</td>
                                <td data-label="Total (MRU)">{res.total}</td>
                                <td data-label="Status">
                                    <span className={`status-badge ${getStatusClass(res.status)}`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td data-label="Actions">
                                    <button className="btn-details">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardReservations;
