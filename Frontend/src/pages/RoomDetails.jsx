import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { getRoomById } from "../services/roomService";
import { createBooking, getUserBookings, cancelBooking } from "../services/bookingService";
import { sendMessage } from "../services/messageService";
import { resolveImageUrl } from "../utils/urlHelper";
import { showSuccess } from "../utils/alerts";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/pages/roomDetails.css";

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

    const ptoday = new Date();
    const today = ptoday.toISOString().split('T')[0];

    const [checkIn, setCheckIn] = useState(today);
    const [days, setDays] = useState(1);
    const [guests, setGuests] = useState(1);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [isDateFocused, setIsDateFocused] = useState(false);

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
        <div className="room-details-page">
            <Header />
            <div className="room-detail-container">
                <Link to="#" onClick={() => window.history.back()} className="room-back-link">
                    <i className="fa-solid fa-arrow-left"></i> Retour
                </Link>

                <div className="room-detail-card">
                    <div className="room-hero">
                        <img src={resolveImageUrl(room.image_url)} alt={room.name} className="room-hero-img" />
                    </div>

                    <div className="room-detail-body">
                        <div className="room-title-row">
                            <h1>{room.name}</h1>
                            <span className="room-price-tag">{room.price_per_night} €</span>
                        </div>

                        <div className="room-meta-row">
                            <span><i className="fa-solid fa-user"></i> Max {room.max_guests || 2} personnes</span>
                            <span><i className="fa-solid fa-ruler-combined"></i> {room.size_sqm || 30} m²</span>
                            {room.floor && <span><i className="fa-solid fa-elevator"></i> Étage {room.floor}</span>}
                        </div>

                        <h3 className="room-section-title">Description</h3>
                        <p className="room-description">{room.description}</p>

                        <h3 className="room-section-title">Équipements</h3>
                        <div className="room-amenities-grid">
                            {room.amenities && room.amenities.map(am => (
                                <div key={am.id} className="room-amenity-item">
                                    <i className={`fa-solid ${am.icon || 'fa-check'}`}></i>
                                    {am.name}
                                </div>
                            ))}
                            {(!room.amenities || room.amenities.length === 0) && <p>Aucun équipement spécifié.</p>}
                        </div>

                        <div className="room-booking-section">
                            {!room.is_available && !userBooking ? (
                                <div className="room-not-available">
                                    ❌ Cette chambre n'est pas disponible pour le moment.
                                </div>
                            ) : userBooking && userBooking.status !== 'cancelled' ? (
                                <div className="booking-status-panel">
                                    {(!userBooking.payment || userBooking.payment.status === 'failed') && (
                                        <div>
                                            <h3>Vous avez réservé cette chambre – Paiement en attente</h3>
                                            <div className="booking-status-warning">
                                                <p>Veuillez régler votre réservation de <strong>{userBooking.total_price} €</strong> (Statut : remboursement) avant l'expiration du délai.</p>
                                                <div className="booking-timer">
                                                    ⌛ {timeLeft || "..."}
                                                </div>
                                                <div className="booking-actions">
                                                    <button
                                                        onClick={() => navigate(`/payment/${userBooking.id}`, { state: { booking: userBooking } })}
                                                        className="booking-action-btn booking-action-pay"
                                                    >Payer maintenant</button>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Annuler cette réservation ?')) {
                                                                await cancelBooking(userBooking.id);
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        className="booking-action-btn booking-action-cancel"
                                                    >Annuler</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {userBooking.payment && userBooking.payment.status === 'pending' && (
                                        <div>
                                            <h3>Vous avez réservé cette chambre</h3>
                                            <div className="booking-status-pending">
                                                <h4>Preuve – En attente d'approbation</h4>
                                                {userBooking.payment.screenshot_url && (
                                                    <div className="proof-container">
                                                        <img src={resolveImageUrl(userBooking.payment.screenshot_url)} alt="Preuve" className="booking-proof-img" />
                                                    </div>
                                                )}
                                                <p>Votre preuve de paiement a été soumise et est en attente d'approbation par l'hôtel.</p>
                                                <p><strong>Total:</strong> {userBooking.total_price} € (Statut: en attente)</p>
                                            </div>
                                        </div>
                                    )}

                                    {userBooking.payment && userBooking.payment.status === 'completed' && (
                                        <div>
                                            <h3>Paiement réussi</h3>
                                            <div className="booking-status-success">
                                                <p>
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
                                    <form onSubmit={handleBooking} className="room-booking-form">
                                        <div>
                                            <label className="room-form-label">Date d'arrivée</label>
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
                                                className="room-form-input"
                                                required
                                            />
                                        </div>

                                        <div className="room-counter-grid">
                                            <div>
                                                <label className="room-form-label">Nombre de jours</label>
                                                <div className="room-counter">
                                                    <button type="button" onClick={() => setDays(Math.max(1, days - 1))} className="room-counter-btn">-</button>
                                                    <span className="room-counter-value">{days}</span>
                                                    <button type="button" onClick={() => setDays(days + 1)} className="room-counter-btn">+</button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="room-form-label">Voyageurs (Max {room.max_guests})</label>
                                                <div className="room-counter">
                                                    <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="room-counter-btn">-</button>
                                                    <span className="room-counter-value">{guests}</span>
                                                    <button type="button" onClick={() => setGuests(Math.min(room.max_guests || 10, guests + 1))} className="room-counter-btn">+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={bookingStatus === 'loading'}
                                            className="room-submit-btn"
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
