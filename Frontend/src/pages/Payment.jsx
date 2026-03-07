import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { getBooking, processPayment, submitLocalPayment } from "../services/bookingService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/pages/payment.css';

function Payment() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [booking, setBooking] = useState(location.state?.booking || null);
    const [loading, setLoading] = useState(!booking);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");

    const [bankApp, setBankApp] = useState("bankily");
    const [phone, setPhone] = useState("");
    const [screenshot, setScreenshot] = useState(null);

    useEffect(() => {
        if (!booking) {
            fetchBooking();
        }
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const data = await getBooking(bookingId);
            setBooking(data.booking);
        } catch (err) {
            console.error("Payment page error:", err);
            setError(err.message || "Impossible de charger la réservation.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (paymentMethod === 'local_app') {
                if (!screenshot) {
                    throw new Error("Veuillez sélectionner une capture d'écran du paiement.");
                }
                const formData = new FormData();
                formData.append('booking_id', booking.id);
                formData.append('bank_app', bankApp);
                formData.append('transaction_phone', phone);
                formData.append('screenshot', screenshot);

                await submitLocalPayment(formData);
                navigate(`/room/${booking.room.id}`, { state: { paymentSuccess: true } });
                return;
            } else {
                const paymentPayload = {
                    payment_method: paymentMethod
                };

                if (paymentMethod === 'credit_card') {
                    paymentPayload.card_last4 = cardNumber.slice(-4);
                }

                await processPayment(bookingId, paymentPayload);
            }

            navigate(`/room/${booking.room.id}`, { state: { paymentSuccess: true } });
        } catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };

    if (loading) return <div className="loading-screen">Chargement...</div>;
    if (error) return <div className="error-screen">Erreur: {error}</div>;
    if (!booking) return <div className="error-screen">Réservation introuvable.</div>;

    return (
        <div className="payment-page">
            <Header />
            <div className="payment-page-container">
                <div className="payment-wrapper">

                    <div className="payment-main">
                        <Link to="/" className="payment-back-link">
                            <i className="fa-solid fa-arrow-left"></i> Retour à l'accueil
                        </Link>

                        <div className="payment-card">
                            <h3>Méthode de paiement</h3>

                            <div className="payment-methods">
                                <div
                                    className={`method-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('credit_card')}
                                >
                                    <i className="fa-solid fa-address-card"></i>
                                    <span>Assurance / Carte Bancaire</span>
                                </div>

                                <div
                                    className={`method-option ${paymentMethod === 'local_app' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('local_app')}
                                >
                                    <i className="fa-solid fa-mobile-screen-button"></i>
                                    <span>App Bancaire (MR)</span>
                                </div>
                            </div>

                            <form onSubmit={handlePayment}>
                                {paymentMethod === 'local_app' ? (
                                    <div className="local-app-fields">
                                        <div className="form-group">
                                            <label className="form-label">Application utiliser</label>
                                            <select
                                                className="form-input"
                                                value={bankApp}
                                                onChange={e => setBankApp(e.target.value)}
                                            >
                                                <option value="bankily">Bankily</option>
                                                <option value="sedad">Sedad</option>
                                                <option value="masrivi">Masrivi</option>
                                                <option value="autre">Autre</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Numéro de téléphone de la transaction</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                placeholder="ex: 42100000"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                required={paymentMethod === 'local_app'}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Preuve de paiement (capture d'écran)</label>
                                            <input
                                                type="file"
                                                className="form-input"
                                                accept="image/*"
                                                onChange={e => setScreenshot(e.target.files[0])}
                                                required={paymentMethod === 'local_app'}
                                            />
                                            <p className="form-hint">
                                                Veuillez joindre une capture d'écran claire de votre reçu de transaction.
                                            </p>
                                        </div>
                                    </div>
                                ) : paymentMethod === 'credit_card' ? (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Titulaire de la carte / Nom de l'assuré</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Nom prénom"
                                                value={cardName}
                                                onChange={e => setCardName(e.target.value)}
                                                required={paymentMethod === 'credit_card'}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Numéro de carte / Référence d'assurance</label>
                                            <div className="card-input-wrapper">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength="19"
                                                    value={cardNumber}
                                                    onChange={e => setCardNumber(e.target.value)}
                                                    required={paymentMethod === 'credit_card'}
                                                />
                                                <div className="card-icons">
                                                    <i className="fa-brands fa-cc-visa"></i>
                                                    <i className="fa-brands fa-cc-mastercard"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-col">
                                                <div className="form-group">
                                                    <label className="form-label">Date d'expiration</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                        value={expiry}
                                                        onChange={e => setExpiry(e.target.value)}
                                                        required={paymentMethod === 'credit_card'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-col">
                                                <div className="form-group">
                                                    <label className="form-label">CVC</label>
                                                    <div className="card-input-wrapper">
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="123"
                                                            maxLength="3"
                                                            value={cvc}
                                                            onChange={e => setCvc(e.target.value)}
                                                            required={paymentMethod === 'credit_card'}
                                                        />
                                                        <div className="card-icons">
                                                            <i className="fa-solid fa-circle-question" style={{ fontSize: '16px', opacity: 0.5 }}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : null}

                                <button
                                    type="submit"
                                    className="pay-btn"
                                    disabled={processing}
                                >
                                    {processing ? 'Traitement...' : (
                                        paymentMethod === 'local_app'
                                            ? `Soumettre la preuve (${booking.total_price} €)`
                                            : `Payer ${booking.total_price} €`
                                    )}
                                </button>

                                <div className="payment-terms">
                                    En cliquant sur Payer, vous acceptez nos conditions générales de vente.
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="payment-sidebar">
                        <div className="booking-summary-card">
                            <div className="summary-header">
                                <h3>Récapitulatif de la réservation</h3>
                            </div>
                            <div className="summary-content">
                                {booking.room && (
                                    <div className="hotel-mini-info">
                                        <img src={booking.room.image_url} alt="Room" className="hotel-thumb" />
                                        <div className="hotel-text">
                                            <h4>{booking.room.name}</h4>
                                            <div className="hotel-loc">
                                                <i className="fa-solid fa-location-dot"></i> {booking.room.location || 'Mauritanie'}
                                            </div>
                                            <div className="hotel-rating-mini">
                                                {booking.room.rating} <i className="fa-solid fa-star" style={{ color: 'gold' }}></i> (Superbe)
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="summary-details">
                                    <div className="detail-row">
                                        <span>Arrivée prévue</span>
                                        <strong>{new Date(booking.check_in_date).toLocaleDateString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Durée</span>
                                        <span>{booking.num_nights} nuits</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Voyageurs</span>
                                        <span>{booking.num_guests} adultes</span>
                                    </div>
                                </div>

                                <div className="price-row">
                                    <span>Total à payer</span>
                                    <span className="price-total-value">{booking.total_price} €</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Payment;
