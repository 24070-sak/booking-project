import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRoomById } from "../services/roomService";
import { createBooking } from "../services/bookingService";
import Header from "../components/Header";
import Footer from "../components/Footer";

function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Booking Form State
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    const [bookingStatus, setBookingStatus] = useState(null); // 'loading', 'success', 'error'

    useEffect(() => {
        async function fetchRoom() {
            try {
                const data = await getRoomById(id);
                setRoom(data.room);
            } catch (err) {
                console.error("Erreur room details:", err);
                setError("Impossible de charger la chambre.");
            } finally {
                setLoading(false);
            }
        }

        fetchRoom();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Veuillez vous connecter pour réserver.");
            navigate("/connexion");
            return;
        }

        if (!checkIn || !checkOut) {
            alert("Veuillez sélectionner vos dates.");
            return;
        }

        setBookingStatus('loading');
        try {
            const data = await createBooking({
                room_id: room.id,
                check_in_date: checkIn,
                check_out_date: checkOut,
                num_guests: guests
            });
            setBookingStatus('success');
            // Redirect to payment page
            setTimeout(() => navigate(`/payment/${data.booking.id}`, { state: { booking: data.booking } }), 1000);
        } catch (err) {
            console.error(err);
            setBookingStatus('error');
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Chargement...</div>;
    if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!room) return null;

    return (
        <div className="home-body">
            <Header />
            <div className="home-container" style={{ marginTop: '20px', padding: '0 20px', maxWidth: '1000px', margin: '20px auto' }}>
                <Link to="#" onClick={() => window.history.back()} style={{ display: 'inline-block', marginBottom: '20px', color: '#1a1a1a', textDecoration: 'none' }}>
                    <i className="fa-solid fa-arrow-left"></i> Retour
                </Link>

                <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <img src={room.image_url} alt={room.name} style={{ width: '100%', height: '500px', objectFit: 'cover' }} />

                    <div style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h1 style={{ margin: 0 }}>{room.name}</h1>

                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71' }}>{room.price_per_night} MRU</span>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
                            <span><i className="fa-solid fa-user"></i> Max {room.max_guests || 2} personnes</span>
                            <span><i className="fa-solid fa-ruler-combined"></i> {room.size_sqm || 30} m²</span>
                            {room.floor && <span><i className="fa-solid fa-elevator"></i> Étage {room.floor}</span>}
                        </div>

                        <h3>Description</h3>
                        <p style={{ lineHeight: '1.6', marginBottom: '30px' }}>{room.description}</p>

                        <h3>Équipements</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                            {room.amenities && room.amenities.map(am => (
                                <div key={am.id} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <i className={`fa-solid ${am.icon || 'fa-check'}`} style={{ marginRight: '10px', color: '#3498db' }}></i>
                                    {am.name}
                                </div>
                            ))}
                            {(!room.amenities || room.amenities.length === 0) && <p>Aucun équipement spécifié.</p>}
                        </div>

                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '30px',
                            borderRadius: '10px',
                            marginTop: '20px'
                        }}>
                            <h3>Réserver votre séjour</h3>
                            {bookingStatus === 'success' ? (
                                <div style={{ color: '#2980b9', padding: '20px', textAlign: 'center', fontSize: '1.2rem' }}>
                                    ✅ Réservation enregistrée ! Passage au paiement...
                                </div>
                            ) : (
                                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Arrivée</label>
                                            <input
                                                type="date"
                                                value={checkIn}
                                                onChange={(e) => setCheckIn(e.target.value)}
                                                style={{ width: '90%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Départ</label>
                                            <input
                                                type="date"
                                                value={checkOut}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                style={{ width: '90%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Voyageurs</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={room.max_guests}
                                            value={guests}
                                            onChange={(e) => setGuests(parseInt(e.target.value))}
                                            style={{ width: '95%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={bookingStatus === 'loading'}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#1a1a1a',
                                            color: 'white',
                                            padding: '20px',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            opacity: bookingStatus === 'loading' ? 0.7 : 1,
                                            marginTop: '10px'
                                        }}
                                    >
                                        {bookingStatus === 'loading' ? 'Traitement...' : 'Confirmer la réservation'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default RoomDetails;
