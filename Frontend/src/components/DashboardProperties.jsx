import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/dashboardProperties.css';
import { propertiesData } from '../data/mockData';

// Import hotel images
import hot1 from '../assets/imgs/hot1.avif';
import hot2 from '../assets/imgs/hot2.avif';
import hot3 from '../assets/imgs/hot3.avif';
import hot4 from '../assets/imgs/hot4.avif';
import hot5 from '../assets/imgs/hot5.webp';
import hotel1 from '../assets/imgs/hotel1.jpeg';
import hotel2 from '../assets/imgs/hotel2.jpeg';

const DashboardProperties = () => {
    const [editingPropertyId, setEditingPropertyId] = useState(null);
    const [isAddingProperty, setIsAddingProperty] = useState(false);
    const [properties, setProperties] = useState(propertiesData);

    // Array of hotel images to cycle through
    const hotelImages = [hot1, hot2, hot3, hot4, hot5, hotel1, hotel2];

    // Form State
    const [price, setPrice] = useState('');
    const [propertyName, setPropertyName] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (editingPropertyId) {
            // Simulate fetching data for the selected property
            console.log("Fetching data for property ID:", editingPropertyId);
            // In a real app, you would find the property from the list or fetch from API
            const property = properties.find(p => p.id === editingPropertyId);
            if (property) {
                setPrice(property.price);
                setPropertyName(property.name);
                setLocation(property.location);
                setStatus(property.status);
                setDescription('A beautiful place...'); // Dummy description
            }
        } else if (isAddingProperty) {
            // Reset form for adding new property
            setPrice('');
            setPropertyName('');
            setLocation('');
            setStatus('Published');
            setDescription('');
        }
    }, [editingPropertyId, isAddingProperty]);

    const handleEditClick = (id) => {
        setEditingPropertyId(id);
        setIsAddingProperty(false);
    };

    const handleAddClick = () => {
        setIsAddingProperty(true);
        setEditingPropertyId(null);
    };

    const handleBackClick = () => {
        setEditingPropertyId(null);
        setIsAddingProperty(false);
    };

    if (editingPropertyId || isAddingProperty) {
        return (
            <div className="dashboard-content">
                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>{isAddingProperty ? 'Add New Property' : 'Update Property'}</h1>
                    <button onClick={handleBackClick} className="btn-secondary">
                        Retour
                    </button>
                </div>

                <div className="dashboard-properties-form">
                    {!isAddingProperty && <h2 style={{ marginBottom: '20px' }}>Property Details (ID: {editingPropertyId})</h2>}

                    <div className="row">
                        <div className="col">
                            <label htmlFor="Name">Property Name</label>
                            <input
                                type="text"
                                value={propertyName}
                                onChange={(e) => setPropertyName(e.target.value)}
                                id="Name"
                                placeholder="e.g. Sunset Villa"
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="location">Location</label>
                            <select name="" id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
                                <option value="">Select Location</option>
                                <option value="Nouakchott">Nouakchott</option>
                                <option value="Tevregh Zeyna">Tevregh Zeyna</option>
                                <option value="Atar">Atar</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <label htmlFor="status">Status</label>
                        <select name="" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>

                    <div className="form-section">
                        <label htmlFor="description">Description</label>
                        <input
                            type="text"
                            placeholder="Enter Property description here ... "
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            id="description"
                        />
                    </div>

                    <div className="form-section">
                        <label htmlFor="price">Price per day (MRU) <small style={{ backgroundColor: '#6c757d' }}>{price}</small></label>
                        <div className="price-input-group">
                            <input
                                type="number"
                                name=""
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <input type="file" name="" id="file" />
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button className="btn-primary">
                            {isAddingProperty ? 'Add Property' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>My Properties</h2>
                <button onClick={handleAddClick} style={{
                    backgroundColor: '#0b3e75',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                }}>
                    + Add New Property
                </button>
            </div>

            <div className="properties-list" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Location</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Price (MRU)</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((property, index) => (
                            <tr key={property.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={hotelImages[index % hotelImages.length]} alt={property.name} style={{ width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover' }} />
                                    <span>{property.name}</span>
                                </td>
                                <td data-label="Location" style={{ padding: '15px' }}>{property.location}</td>
                                <td data-label="Status" style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '15px',
                                        backgroundColor: property.status === 'Published' ? '#e6f7e6' : '#fff3cd',
                                        color: property.status === 'Published' ? '#28a745' : '#856404',
                                        fontSize: '12px'
                                    }}>
                                        {property.status}
                                    </span>
                                </td>
                                <td data-label="Price (MRU)" style={{ padding: '15px' }}>{property.price}</td>
                                <td data-label="Actions" style={{ padding: '15px' }}>
                                    <button
                                        onClick={() => handleEditClick(property.id)}
                                        className="btn-edit"
                                    >
                                        Edit
                                    </button>
                                    <button className="btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardProperties;
