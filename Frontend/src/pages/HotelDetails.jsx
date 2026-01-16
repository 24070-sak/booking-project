import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getHotelById, getHotelRooms } from "../services/hotelService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/pages/home.css";

function HotelDetails() {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const hotelData = await getHotelById(id);
                setHotel(hotelData.hotel);

                const roomsData = await getHotelRooms(id);
                setRooms(roomsData.rooms);

            } catch (err) {
                console.error("Erreur chargement détails:", err);
                setError("Impossible de charger les détails de l'hôtel.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    if (loading) return (
        <>
            <Header />
            <div style={{ padding: '50px', textAlign: 'center' }}>Chargement...</div>
            <Footer />
        </>
    );

    if (error) return (
        <>
            <Header />
            <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
                {error}
                <br /><Link to="/">Retour à l'accueil</Link>
            </div>
            <Footer />
        </>
    );

    if (!hotel) return null;

    return (
        <div className="home-body">
            <Header />
            <div className="home-container" style={{ marginTop: '20px', padding: '0 20px' }}>
                <Link to="/" className="back-link" style={{ display: 'inline-block', marginBottom: '20px', color: '#1a1a1a', textDecoration: 'none' }}>
                    <i className="fa-solid fa-arrow-left"></i> Retour aux hôtels
                </Link>

                {/* Section Hôtel */}
                <div className="details-container" style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    maxWidth: '1200px',
                    margin: '0 auto 50px auto'
                }}>
                    <div className="details-image" style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                        <img
                            src={hotel.image_url}
                            alt={hotel.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <div className="details-content" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1a1a1a' }}>{hotel.name}</h1>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f1c40f' }}>{hotel.rating} ⭐</span>
                        </div>

                        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
                            <i className="fa-solid fa-location-dot"></i> {hotel.location}
                        </p>

                        <p>{hotel.description}</p>
                    </div>
                </div>

                {/* Section Chambres */}
                <h2 style={{ maxWidth: '1200px', margin: '0 auto 20px auto' }}>Disponibilités</h2>
                <div className="rooms-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto 50px auto'
                }}>
                    {rooms.map(room => (
                        <div key={room.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <img src={room.image_url} alt={room.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '20px' }}>
                                <h3>{room.name}</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>{room.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2ecc71' }}>{room.price_per_night}€ / nuit</span>
                                    {/* Link to Room Details */}
                                    <Link to={`/room/${room.id}`}>
                                        <button style={{
                                            backgroundColor: '#1a1a1a',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 15px',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}>
                                            Voir la chambre
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {rooms.length === 0 && <p>Aucune chambre disponible pour moment.</p>}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default HotelDetails;
