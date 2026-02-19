import React, { useState, useEffect } from 'react';
import { getMyHotels, createHotel, updateHotel, deleteHotel, getHotelRooms } from '../services/hotelService';
import { createRoom, updateRoom, deleteRoom, getRoomTypes, getAmenities } from '../services/roomService';
import '../styles/components/dashboardProperties.css';

// Import hotel images
import hot1 from '../assets/imgs/hot1.avif';
import hot2 from '../assets/imgs/hot2.avif';
import hot3 from '../assets/imgs/hot3.avif';
import hot4 from '../assets/imgs/hot4.avif';
import hot5 from '../assets/imgs/hot5.webp';
import hotel1 from '../assets/imgs/hotel1.jpeg';
import hotel2 from '../assets/imgs/hotel2.jpeg';

const DashboardProperties = () => {
    // Hotel State
    const [editingPropertyId, setEditingPropertyId] = useState(null);
    const [isAddingProperty, setIsAddingProperty] = useState(false);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Room Management State
    const [viewingRoomsHotelId, setViewingRoomsHotelId] = useState(null);
    const [hotelRooms, setHotelRooms] = useState([]);
    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [amenities, setAmenities] = useState([]);

    // Hotel Form State
    const [propertyName, setPropertyName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Room Form State
    const [roomForm, setRoomForm] = useState({
        room_number: '',
        name: '',
        description: '',
        room_type_id: '',
        price_per_night: '',
        max_guests: 2,
        size_sqm: '',
        image_url: '',
        amenities: []
    });

    const hotelImages = [hot1, hot2, hot3, hot4, hot5, hotel1, hotel2];

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await getMyHotels();
            if (data.hotels) {
                setProperties(data.hotels);
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const data = await getRoomTypes();
            setRoomTypes(data.room_types || []);
        } catch (error) {
            console.error("Error fetching room types:", error);
        }
    };

    const fetchAmenities = async () => {
        try {
            const data = await getAmenities();
            setAmenities(data.amenities || []);
        } catch (error) {
            console.error("Error fetching amenities:", error);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchRoomTypes();
        fetchAmenities();
    }, []);

    useEffect(() => {
        if (editingPropertyId) {
            const property = properties.find(p => p.id === editingPropertyId);
            if (property) {
                setPropertyName(property.name);
                setLocation(property.location);
                setDescription(property.description || '');
                setImageUrl(property.image_url || '');
            }
        } else if (isAddingProperty) {
            setPropertyName('');
            setLocation('');
            setDescription('');
            setImageUrl('');
        }
    }, [editingPropertyId, isAddingProperty, properties]);

    const handleEditClick = (id) => {
        setEditingPropertyId(id);
        setIsAddingProperty(false);
        setViewingRoomsHotelId(null);
    };

    const handleAddClick = () => {
        setIsAddingProperty(true);
        setEditingPropertyId(null);
        setViewingRoomsHotelId(null);
    };

    const handleViewRoomsClick = async (hotelId) => {
        setViewingRoomsHotelId(hotelId);
        setEditingPropertyId(null);
        setIsAddingProperty(false);
        try {
            const data = await getHotelRooms(hotelId);
            setHotelRooms(data.rooms || []);
        } catch (error) {
            alert("Erreur lors de la récupération des chambres");
        }
    };

    const handleBackClick = () => {
        setEditingPropertyId(null);
        setIsAddingProperty(false);
        setViewingRoomsHotelId(null);
        setIsAddingRoom(false);
        setEditingRoomId(null);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this property?")) {
            try {
                await deleteHotel(id);
                fetchProperties();
            } catch (error) {
                alert("Échec de la suppression : " + error.message);
            }
        }
    };

    const handleSubmit = async () => {
        const hotelData = {
            name: propertyName,
            location: location,
            description: description,
            image_url: imageUrl,
            rating: 0
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
            alert("Opération échouée : " + error.message);
        }
    };

    // Room Handlers
    const handleAddRoomClick = () => {
        setIsAddingRoom(true);
        setEditingRoomId(null);
        setRoomForm({
            room_number: '',
            name: '',
            description: '',
            room_type_id: roomTypes[0]?.id || '',
            price_per_night: '',
            max_guests: 2,
            size_sqm: '',
            image_url: '',
            amenities: []
        });
    };

    const handleEditRoomClick = (room) => {
        setEditingRoomId(room.id);
        setIsAddingRoom(false);
        setRoomForm({
            room_number: room.room_number,
            name: room.name,
            description: room.description || '',
            room_type_id: room.room_type_id,
            price_per_night: room.price_per_night,
            max_guests: room.max_guests,
            size_sqm: room.size_sqm || '',
            image_url: room.image_url || '',
            amenities: room.amenities ? room.amenities.map(a => a.id) : []
        });
    };

    const handleDeleteRoomClick = async (roomId) => {
        if (window.confirm("Supprimer cette chambre ?")) {
            try {
                await deleteRoom(roomId);
                handleViewRoomsClick(viewingRoomsHotelId);
            } catch (error) {
                alert("Erreur: " + error.message);
            }
        }
    };

    const handleRoomSubmit = async () => {
        const data = { ...roomForm, hotel_id: viewingRoomsHotelId };
        try {
            if (isAddingRoom) {
                await createRoom(data);
            } else {
                await updateRoom(editingRoomId, data);
            }
            setIsAddingRoom(false);
            setEditingRoomId(null);
            handleViewRoomsClick(viewingRoomsHotelId);
        } catch (error) {
            alert("Erreur: " + error.message);
        }
    };

    if (editingPropertyId || isAddingProperty) {
        return (
            <div className="dashboard-content dashboard-properties-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h2>{isAddingProperty ? 'Ajouter une propriété' : 'Modifier la propriété'}</h2>
                    <button onClick={handleBackClick} className="btn-secondary">Retour</button>
                </div>
                <div className="dashboard-properties-form">
                    <div className="row">
                        <div className="col">
                            <label>Nom de la propriété</label>
                            <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
                        </div>
                        <div className="col">
                            <label>Location</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-section">
                        <label>URL de l'image</label>
                        <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>
                    <div className="form-section">
                        <label>Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <button className="btn-primary" onClick={handleSubmit}>Enregistrer</button>
                    </div>
                </div>
            </div>
        );
    }

    if (viewingRoomsHotelId) {
        const hotel = properties.find(p => p.id === viewingRoomsHotelId);
        return (
            <div className="dashboard-content dashboard-properties-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h2>Chambres de : {hotel?.name}</h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={handleAddRoomClick} className="btn-primary">+ Ajouter une chambre</button>
                        <button onClick={handleBackClick} className="btn-secondary">Retour</button>
                    </div>
                </div>

                {(isAddingRoom || editingRoomId) && (
                    <div className="dashboard-properties-form" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                        <h3>{isAddingRoom ? 'Nouvelle Chambre' : 'Modifier Chambre'}</h3>
                        <div className="row">
                            <div className="col">
                                <label>Numéro</label>
                                <input type="text" value={roomForm.room_number} onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })} />
                            </div>
                            <div className="col">
                                <label>Nom</label>
                                <input type="text" value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label>Type</label>
                                <select value={roomForm.room_type_id} onChange={e => setRoomForm({ ...roomForm, room_type_id: e.target.value })}>
                                    {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                </select>
                            </div>
                            <div className="col">
                                <label>Prix / Nuit</label>
                                <input type="number" value={roomForm.price_per_night} onChange={e => setRoomForm({ ...roomForm, price_per_night: e.target.value })} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label>Capacité Max</label>
                                <input type="number" value={roomForm.max_guests} onChange={e => setRoomForm({ ...roomForm, max_guests: e.target.value })} />
                            </div>
                            <div className="col">
                                <label>Taille (m²)</label>
                                <input type="number" step="0.1" value={roomForm.size_sqm} onChange={e => setRoomForm({ ...roomForm, size_sqm: e.target.value })} placeholder="Ex: 25.5" />
                            </div>
                        </div>
                        <div className="form-section">
                            <label>Image URL</label>
                            <input type="text" value={roomForm.image_url} onChange={e => setRoomForm({ ...roomForm, image_url: e.target.value })} />
                        </div>
                        <div className="form-section">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Équipements</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                {amenities.map(amenity => (
                                    <label key={amenity.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={roomForm.amenities.includes(amenity.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setRoomForm({ ...roomForm, amenities: [...roomForm.amenities, amenity.id] });
                                                } else {
                                                    setRoomForm({ ...roomForm, amenities: roomForm.amenities.filter(id => id !== amenity.id) });
                                                }
                                            }}
                                        />
                                        <span>{amenity.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <button className="btn-primary" onClick={handleRoomSubmit}>Enregistrer Chambre</button>
                            <button className="btn-secondary" onClick={() => { setIsAddingRoom(false); setEditingRoomId(null); }} style={{ marginLeft: '10px' }}>Annuler</button>
                        </div>
                    </div>
                )}

                <div className="properties-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Nom</th>
                                <th>Type</th>
                                <th>Taille</th>
                                <th>Prix</th>
                                <th>Équipements</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotelRooms.map(room => (
                                <tr key={room.id}>
                                    <td data-label="Numéro">{room.room_number}</td>
                                    <td data-label="Nom">{room.name}</td>
                                    <td data-label="Type">{roomTypes.find(t => t.id === room.room_type_id)?.name || room.room_type_id}</td>
                                    <td data-label="Taille">{room.size_sqm ? `${room.size_sqm} m²` : '-'}</td>
                                    <td data-label="Prix">{room.price_per_night} MRU</td>
                                    <td data-label="Équipements">
                                        {room.amenities && room.amenities.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {room.amenities.slice(0, 3).map(a => (
                                                    <span key={a.id} style={{ fontSize: '0.85em', padding: '2px 6px', background: '#e3f2fd', borderRadius: '4px' }}>
                                                        {a.name}
                                                    </span>
                                                ))}
                                                {room.amenities.length > 3 && <span style={{ fontSize: '0.85em' }}>+{room.amenities.length - 3}</span>}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td data-label="Actions">
                                        <button onClick={() => handleEditRoomClick(room)} className="btn-edit">Modifier</button>
                                        <button onClick={() => handleDeleteRoomClick(room.id)} className="btn-danger">Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="dashboard-content dashboard-properties-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2>Gestion des Hôtels</h2>
                <button onClick={handleAddClick} className="btn-primary">+ Ajouter un Hôtel</button>
            </div>

            <div className="properties-list">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Localisation</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((property, index) => (
                            <tr key={property.id}>
                                <td data-label="Nom">
                                    <img src={property.image_url || hotelImages[index % hotelImages.length]} alt={property.name} />
                                    <span>{property.name}</span>
                                </td>
                                <td data-label="Localisation">{property.location}</td>
                                <td data-label="Actions">
                                    <button onClick={() => handleViewRoomsClick(property.id)} className="btn-secondary">Chambres</button>
                                    <button onClick={() => handleEditClick(property.id)} className="btn-edit">Modifier</button>
                                    <button onClick={() => handleDeleteClick(property.id)} className="btn-danger">Supprimer</button>
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
