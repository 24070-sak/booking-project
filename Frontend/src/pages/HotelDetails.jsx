import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHotelById, getHotelRooms } from "../services/hotelService";
import { getHotelReviews, createReview } from "../services/reviewService";
import { getUserBookings } from "../services/bookingService";
import { sendMessage } from "../services/messageService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/pages/hotelDetails.css"; // New Premium Styles

function HotelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Modal States
    const [showContactModal, setShowContactModal] = useState(false);
    const [messageData, setMessageData] = useState({ subject: '', content: '' });

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [reviewRoomId, setReviewRoomId] = useState(null);
    const [stats, setStats] = useState({ average: 0, count: 0 });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        async function fetchData() {
            try {
                // 1. Get Hotel Details
                const hotelData = await getHotelById(id);
                setHotel(hotelData.hotel);

                // 2. Get Rooms
                const roomsData = await getHotelRooms(id);
                setRooms(roomsData.rooms);

                // 3. Get Reviews
                try {
                    const reviewsData = await getHotelReviews(id);
                    setReviews(reviewsData.reviews);
                    setStats({
                        average: reviewsData.average_rating || 0,
                        count: reviewsData.total || 0
                    });
                } catch (e) {
                    console.error("Error fetching reviews", e);
                }

                // 4. Check if user can review
                if (storedUser) {
                    try {
                        const bookingsData = await getUserBookings();
                        const hotelIdInt = parseInt(id);
                        const completedBooking = bookingsData.bookings.find(b =>
                            b.status === 'completed' &&
                            b.room &&
                            b.room.hotel_id === hotelIdInt
                        );

                        if (completedBooking) {
                            setReviewRoomId(completedBooking.room_id);
                        }
                    } catch (e) {
                        console.error("Error checking bookings", e);
                    }
                }

            } catch (err) {
                console.error("Erreur chargement détails:", err);
                setError("Impossible de charger les détails de l'hôtel.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            await sendMessage({
                ...messageData,
                receiver_id: hotel.owner_id
            });
            alert("Message envoyé avec succès !");
            setShowContactModal(false);
            setMessageData({ subject: '', content: '' });
        } catch (err) {
            alert("Erreur: " + err.message);
        }
    };

    const handleCreateReview = async (e) => {
        e.preventDefault();
        if (!reviewRoomId) return;

        try {
            await createReview({
                room_id: reviewRoomId,
                rating: parseInt(reviewData.rating),
                comment: reviewData.comment
            });

            const newReviewsData = await getHotelReviews(id);
            setReviews(newReviewsData.reviews);
            setStats({
                average: newReviewsData.average_rating || 0,
                count: newReviewsData.total || 0
            });

            // Close modal (no alert for smoother UX)
            setShowReviewModal(false);
            setReviewData({ rating: 5, comment: '' });
        } catch (err) {
            alert("Erreur: " + err.message);
        }
    };

    if (loading) return (
        <>
            <Header />
            <div style={{ padding: '100px 0', textAlign: 'center' }}>Chargement...</div>
            <Footer />
        </>
    );

    if (error) return (
        <>
            <Header />
            <div style={{ padding: '100px 0', textAlign: 'center', color: '#ff385c' }}>
                {error}
                <br /><Link to="/" className="nav-back">Retour à l'accueil</Link>
            </div>
            <Footer />
        </>
    );

    if (!hotel) return null;

    return (
        <div className="hotel-details-page">
            <Header />

            <div className="max-w-container">
                {/* Navigation */}
                <Link to="/" className="nav-back">
                    <i className="fa-solid fa-chevron-left"></i> Retour aux hôtels
                </Link>

                {/* Hotel Header */}
                <div className="hotel-header">
                    <h1 className="hotel-title">{hotel.name}</h1>
                    <div className="hotel-meta">
                        <div className="meta-left">
                            <span className="rating-pill">
                                <i className="fa-solid fa-star" style={{ color: '#ff385c' }}></i>
                                {hotel.rating} · <span style={{ textDecoration: 'underline' }}>{stats.count} avis</span>
                            </span>
                            <span className="location-link">
                                {hotel.location}
                            </span>
                        </div>
                        <div className="action-buttons">
                            {/* Share/Save buttons could go here */}
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="hero-section">
                    <img src={hotel.image_url} alt={hotel.name} className="hero-image" />
                </div>

                {/* Content Grid */}
                <div className="content-grid">

                    {/* Left Column: Info & Details */}
                    <div className="main-content">

                        {/* Host Info */}
                        <div className="host-info-row">
                            <div className="host-text">
                                <h2>Hébergé par Hôte {hotel.owner_id || ''}</h2>
                                <p>Superhôte · Réponse rapide</p>
                            </div>
                            <div className="host-avatar">
                                {hotel.name.charAt(0)}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="main-info">
                            <p className="description-text">{hotel.description}</p>
                        </div>

                        {/* Rooms Section */}
                        <div className="rooms-section">
                            <h2 className="section-title">Où vous dormirez</h2>
                            <div className="rooms-grid">
                                {rooms.map(room => (
                                    <div key={room.id} className="room-card">
                                        <img src={room.image_url} alt={room.name} className="room-img" />
                                        <div className="room-info">
                                            <h3 className="room-name">{room.name}</h3>
                                            <p className="room-desc">{room.description}</p>
                                            <div className="room-footer">
                                                <span style={{ fontWeight: '600' }}>{room.price_per_night}€ <span style={{ fontWeight: '400' }}>nuit</span></span>
                                                <Link to={`/room/${room.id}`}>
                                                    <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '14px' }}>
                                                        Voir
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Sticky Booking Card */}
                    <div className="sidebar">
                        <div className="booking-card">
                            <div className="card-header">
                                <span className="price-tag">
                                    À partir de {Math.min(...rooms.map(r => r.price_per_night), 0) || 100}€ <span className="price-unit">par nuit</span>
                                </span>
                                <div className="card-rating">
                                    <i className="fa-solid fa-star" style={{ color: '#ff385c' }}></i>
                                    {hotel.rating}
                                </div>
                            </div>

                            <button onClick={() => {
                                // Scroll to rooms
                                document.querySelector('.rooms-section').scrollIntoView({ behavior: 'smooth' });
                            }}
                                className="primary-btn">
                                Vérifier la disponibilité
                            </button>

                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        if (!user) { navigate('/login'); return; }
                                        setShowContactModal(true);
                                    }}
                                    className="secondary-btn"
                                    style={{ width: '100%', border: 'none', textDecoration: 'underline' }}
                                >
                                    Contacter l'hôte
                                </button>
                            </div>

                            {reviewRoomId && (
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="secondary-btn"
                                    style={{ width: '100%', marginTop: '8px', border: '1px solid #222' }}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i> Écrire un avis
                                </button>
                            )}

                        </div>
                    </div>

                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <i className="fa-solid fa-star star-big" style={{ color: '#ff385c' }}></i>
                        <h2 className="section-title" style={{ margin: 0 }}>
                            {stats.average.toFixed(2)} · {stats.count} commentaires
                        </h2>
                    </div>

                    <div className="reviews-grid">
                        {reviews.slice(0, 6).map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-user">
                                    <div className="user-pic">
                                        {review.user_picture ? (
                                            <img src={review.user_picture} alt={review.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        ) : (
                                            review.user_name.charAt(0)
                                        )}
                                    </div>
                                    <div className="user-meta">
                                        <h4>{review.user_name}</h4>
                                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="review-content">
                                    <p className="review-text">
                                        {review.comment}
                                    </p>
                                    <div className="room-tag">
                                        Séjour en {review.room_name || 'chambre'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Modal Contact */}
            {showContactModal && (
                <div className="modal-backdrop" onClick={() => setShowContactModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowContactModal(false)}>&times;</button>
                        <h2 className="modal-title">Contacter l'hôte</h2>
                        <form onSubmit={handleSendMessage}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Sujet</label>
                                <input
                                    type="text" required
                                    className="form-input"
                                    value={messageData.subject}
                                    onChange={e => setMessageData({ ...messageData, subject: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Message</label>
                                <textarea
                                    required rows="5"
                                    className="form-textarea"
                                    value={messageData.content}
                                    onChange={e => setMessageData({ ...messageData, content: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="primary-btn">Envoyer le message</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Review */}
            {showReviewModal && (
                <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowReviewModal(false)}>&times;</button>
                        <h2 className="modal-title">Comment était votre séjour ?</h2>
                        <form onSubmit={handleCreateReview}>
                            <div className="rating-select">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        type="button"
                                        key={star}
                                        className={`star-btn ${star <= reviewData.rating ? 'active' : ''}`}
                                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                                    >
                                        <i className={`fa-star ${star <= reviewData.rating ? 'fa-solid' : 'fa-regular'}`}></i>
                                    </button>
                                ))}
                            </div>
                            <p style={{ textAlign: 'center', marginBottom: '24px', color: '#717171' }}>
                                {reviewData.rating} étoiles
                            </p>

                            <div className="form-group">
                                <textarea
                                    placeholder="Partagez votre expérience avec les autres voyageurs..." required
                                    rows="5"
                                    className="form-textarea"
                                    value={reviewData.comment}
                                    onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="primary-btn">Publier l'avis</button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default HotelDetails;
