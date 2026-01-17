import React, { useState, useEffect } from 'react';
import { getAllHotels, createHotel, updateHotel, deleteHotel } from '../services/hotelService';
import '../styles/components/dashboardProperties.css';

// Import hotel images (keep existing imports for default or fallback)
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
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [price, setPrice] = useState(''); // Note: Backend "Hotel" model doesn't have price, but "Room" does. We might just store it locally or ignore for now if not in Hotel model.
    const [propertyName, setPropertyName] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('Published'); // Not in backend model yet
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const hotelImages = [hot1, hot2, hot3, hot4, hot5, hotel1, hotel2];

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await getAllHotels();
            if (data.hotels) {
                setProperties(data.hotels);
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (editingPropertyId) {
            const property = properties.find(p => p.id === editingPropertyId);
            if (property) {
                setPropertyName(property.name);
                setLocation(property.location);
                setDescription(property.description || '');
                setImageUrl(property.image_url || '');
                // Status and Price are not in Hotel model, ignoring for fill
            }
        } else if (isAddingProperty) {
            setPropertyName('');
            setLocation('');
            setStatus('Published');
            setDescription('');
            setImageUrl('');
            setPrice('');
        }
    }, [editingPropertyId, isAddingProperty, properties]);

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

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this property?")) {
            try {
                await deleteHotel(id);
                fetchProperties();
            } catch (error) {
                alert("Failed to delete property: " + error.message);
            }
        }
    };

    const handleSubmit = async () => {
        const hotelData = {
            name: propertyName,
            location: location,
            description: description,
            image_url: imageUrl,
            rating: 0 // Default
        };

        try {
            if (isAddingProperty) {
                await createHotel(hotelData);
            } else if (editingPropertyId) {
                await updateHotel(editingPropertyId, hotelData);
            }
            fetchProperties();
            handleBackClick();
        } catch (error) {
            alert("Operation failed: " + error.message);
        }
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
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                id="location"
                                placeholder="City or Address"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <label htmlFor="imageUrl">Image URL</label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            id="imageUrl"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-section">
                        <label htmlFor="description">Description</label>
                        <textarea
                            style={{ width: '100%', padding: '10px' }}
                            placeholder="Enter Property description here ... "
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            id="description"
                        />
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button className="btn-primary" onClick={handleSubmit}>
                            {isAddingProperty ? 'Add Property' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div>Chargement...</div>;

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
                            <th style={{ padding: '15px', textAlign: 'left' }}>Rating</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((property, index) => (
                            <tr key={property.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={property.image_url || hotelImages[index % hotelImages.length]} alt={property.name} style={{ width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover' }} />
                                    <span>{property.name}</span>
                                </td>
                                <td data-label="Location" style={{ padding: '15px' }}>{property.location}</td>
                                <td data-label="Rating" style={{ padding: '15px' }}>{property.rating}</td>
                                <td data-label="Actions" style={{ padding: '15px' }}>
                                    <button
                                        onClick={() => handleEditClick(property.id)}
                                        className="btn-edit"
                                    >
                                        Edit
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDeleteClick(property.id)}>Delete</button>
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
