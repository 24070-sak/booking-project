import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { getRoomById } from "../services/roomService";
import { createBooking, getUserBookings, cancelBooking } from "../services/bookingService";
import { showSuccess } from "../utils/alerts";
import Header from "../components/Header";
import Footer from "../components/Footer";

function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location.state?.paymentSuccess) {
            showSuccess("Paiement réussi, merci d'avoir réservé notre service !");
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    // Booking Form State
    const ptoday = new Date();
    const today = ptoday.toISOString().split('T')[0];

    const [checkIn, setCheckIn] = useState(today);
    const [days, setDays] = useState(1);
    const [guests, setGuests] = useState(1);
    const [bookingStatus, setBookingStatus] = useState(null); // 'loading', 'success', 'error'
    const [isDateFocused, setIsDateFocused] = useState(false);

    // Reserved booking states
    const [userBooking, setUserBooking] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";
        const [yyyy, mm, dd] = dateString.split("-");
        return `${dd}/${mm}/${yyyy}`;
    };

    useEffect(() => {
        async function fetchRoom() {
            try {
                const data = await getRoomById(id);
                setRoom(data.room);

                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const bookingsData = await getUserBookings();
                        const activeBooking = bookingsData.bookings.find(
                            b => b.room && b.room.id === parseInt(id) && ['pending', 'confirmed'].includes(b.status)
                        );
                        setUserBooking(activeBooking || null);
                    } catch (e) {
                        console.error("Erreur chargement bookings:", e);
                    }
                }
            } catch (err) {
                console.error("Erreur room details:", err);
                setError("Impossible de charger la chambre.");
            } finally {
                setLoading(false);
            }
        }

        fetchRoom();
    }, [id]);

    useEffect(() => {
        if (!userBooking || (userBooking.payment && userBooking.payment.status !== 'failed') || userBooking.status === 'cancelled') return;

        const bookingTime = new Date(userBooking.created_at).getTime();
        const expiryTime = bookingTime + 30 * 60 * 1000;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = expiryTime - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft("00:00");
                if (userBooking.status !== 'cancelled') {
                    cancelBooking(userBooking.id).then(() => {
                        alert("Votre réservation a été annulée car le délai de paiement a expiré.");
                        window.location.reload();
                    }).catch(console.error);
                }
            } else {
                const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const sec = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [userBooking]);

    const handleBooking = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Veuillez vous connecter pour réserver.");
            navigate("/connexion");
            return;
        }

        if (!checkIn || days < 1) {
            alert("Veuillez indiquer une date d'arrivée valide et le nombre de jours.");
            return;
        }

        // Calculate checkOut
        const checkInDateObj = new Date(checkIn);
        const checkOutDateObj = new Date(checkInDateObj);
        checkOutDateObj.setDate(checkOutDateObj.getDate() + parseInt(days));

        const checkOut = checkOutDateObj.toISOString().split('T')[0];

        setBookingStatus('loading');
        try {
            const data = await createBooking({
                room_id: room.id,
                check_in_date: checkIn,
                check_out_date: checkOut,
                num_guests: guests
            });
            setBookingStatus('success');
            // Show booking status UI instantly
            setUserBooking(data.booking);
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
                <Link to="#" onClick={() => window.history.back()} style={{ display: 'inline-block', marginBottom: '20px', color: '#006233', textDecoration: 'none', fontWeight: '600' }}>
                    <i className="fa-solid fa-arrow-left"></i> Retour
                </Link>

                <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <img src={room.image_url} alt={room.name} style={{ width: '100%', height: '500px', objectFit: 'cover' }} />

                    <div style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h1 style={{ margin: 0 }}>{room.name}</h1>

                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#006233' }}>{room.price_per_night} €</span>
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
                                    <i className={`fa-solid ${am.icon || 'fa-check'}`} style={{ marginRight: '10px', color: '#006233' }}></i>
                                    {am.name}
                                </div>
                            ))}
                            {(!room.amenities || room.amenities.length === 0) && <p>Aucun équipement spécifié.</p>}
                        </div>

                        <div style={{
                            backgroundColor: '#f0f7f2',
                            padding: '30px',
                            borderRadius: '10px',
                            marginTop: '20px',
                            border: '1px solid rgba(0, 98, 51, 0.1)'
                        }}>
                            {!room.is_available && !userBooking ? (
                                <div style={{ color: 'red', padding: '20px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '600' }}>
                                    ❌ Cette chambre n'est pas disponible pour le moment.
                                </div>
                            ) : userBooking && userBooking.status !== 'cancelled' ? (
                                <div className="active-booking-status" style={{ padding: '10px' }}>
                                    {(!userBooking.payment || userBooking.payment.status === 'failed') && (
                                        <div style={{ textAlign: 'center' }}>
                                            <h3 style={{ color: '#006233', margin: 0 }}>You have booked this room – Payment pending</h3>
                                            <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '10px', marginTop: '15px' }}>
                                                <p style={{ margin: 0 }}>Veuillez régler votre réservation de <strong>{userBooking.total_price} €</strong> (Statut : remboursement) avant l'expiration du délai.</p>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c62828', margin: '15px 0' }}>
                                                    ⌛ {timeLeft || "..."}
                                                </div>
                                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => navigate(`/payment/${userBooking.id}`, { state: { booking: userBooking } })}
                                                        style={{ padding: '12px 25px', backgroundColor: '#006233', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                                                    >Payer maintenant</button>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Annuler cette réservation ?')) {
                                                                await cancelBooking(userBooking.id);
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        style={{ padding: '12px 25px', backgroundColor: '#f44336', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                                                    >Annuler</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {userBooking.payment && userBooking.payment.status === 'pending' && (
                                        <div style={{ textAlign: 'center' }}>
                                            <h3 style={{ color: '#006233', margin: 0 }}>You have booked this room</h3>
                                            <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '10px', marginTop: '15px' }}>
                                                <h4 style={{ color: '#e65100', marginBottom: '10px', fontSize: '1.2rem' }}>Proof – Pending Approval</h4>
                                                {userBooking.payment.screenshot_url && (
                                                    <img src={userBooking.payment.screenshot_url} alt="Preuve" style={{ maxWidth: '100%', height: '150px', objectFit: 'contain', borderRadius: '8px', margin: '10px 0', border: '1px solid #ffe0b2' }} />
                                                )}
                                                <p>Votre preuve de paiement a été soumise et est en attente d'approbation par l'hôtel.</p>
                                                <p><strong>Total:</strong> {userBooking.total_price} € (Statut: en attente)</p>
                                            </div>
                                        </div>
                                    )}

                                    {userBooking.payment && userBooking.payment.status === 'completed' && (
                                        <div style={{ textAlign: 'center' }}>
                                            <h3 style={{ color: '#006233', margin: 0 }}>Paiement réussi</h3>
                                            <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginTop: '15px' }}>
                                                <p style={{ color: '#2e7d32', marginBottom: '15px', fontWeight: '600' }}>
                                                    {userBooking.payment.payment_method === 'local_app' ? 'Paiement confirmé' : "Montant payé directement à l'hôtel."}
                                                </p>
                                                <p><strong>Détails:</strong> {userBooking.num_guests} adultes, {formatDateDisplay(userBooking.check_in_date)} au {formatDateDisplay(userBooking.check_out_date)}</p>
                                                <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>Merci d'avoir réservé ce service !</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <h3>Réserver votre séjour</h3>
                                    <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date d'arrivée</label>
                                            <input
                                                type={isDateFocused ? "date" : "text"}
                                                min={today}
                                                value={isDateFocused ? checkIn : formatDateDisplay(checkIn)}
                                                onFocus={() => setIsDateFocused(true)}
                                                onBlur={() => setIsDateFocused(false)}
                                                onChange={(e) => {
                                                    const newVal = e.target.value;
                                                    if (newVal) setCheckIn(newVal);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1.5px solid rgba(0, 98, 51, 0.2)',
                                                    backgroundColor: '#000',
                                                    color: '#fff',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                                required
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre de jours</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDays(Math.max(1, days - 1))}
                                                        style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1.5px solid rgba(0, 98, 51, 0.2)', backgroundColor: '#fff', fontSize: '1.2rem', cursor: 'pointer', color: '#006233' }}
                                                    >-</button>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{days}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDays(days + 1)}
                                                        style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1.5px solid rgba(0, 98, 51, 0.2)', backgroundColor: '#fff', fontSize: '1.2rem', cursor: 'pointer', color: '#006233' }}
                                                    >+</button>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Voyageurs (Max {room.max_guests})</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                                        style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1.5px solid rgba(0, 98, 51, 0.2)', backgroundColor: '#fff', fontSize: '1.2rem', cursor: 'pointer', color: '#006233' }}
                                                    >-</button>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{guests}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGuests(Math.min(room.max_guests || 10, guests + 1))}
                                                        style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1.5px solid rgba(0, 98, 51, 0.2)', backgroundColor: '#fff', fontSize: '1.2rem', cursor: 'pointer', color: '#006233' }}
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={bookingStatus === 'loading'}
                                            style={{
                                                width: '100%',
                                                background: 'linear-gradient(135deg, #006233, #00843d)',
                                                color: 'white',
                                                padding: '20px',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                opacity: bookingStatus === 'loading' ? 0.7 : 1,
                                                marginTop: '10px',
                                                letterSpacing: '0.5px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {bookingStatus === 'loading' ? 'Traitement...' : 'Confirmer la réservation'}
                                        </button>
                                    </form>
                                </>
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
