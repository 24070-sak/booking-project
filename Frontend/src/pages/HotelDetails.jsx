import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHotelById, getHotelRooms } from "../services/hotelService";
import { getHotelReviews, createReview } from "../services/reviewService";
import { getUserBookings } from "../services/bookingService";
import { sendMessage } from "../services/messageService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { resolveImageUrl } from "../utils/urlHelper";
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
                // Check if this is a unique visit for the user
                const visitedKey = `visited_hotel_${id}`;
                const hasVisited = localStorage.getItem(visitedKey);
                let isUnique = false;
                if (!hasVisited) {
                    localStorage.setItem(visitedKey, 'true');
                    isUnique = true;
                }

                // 1. Get Hotel Details
                const hotelData = await getHotelById(id, isUnique);
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
                subject: messageData.subject || "Question",
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

        // Use reviewRoomId (verified booking) or fallback to first available room of the hotel
        let effectiveRoomId = reviewRoomId;
        if (!effectiveRoomId && rooms.length > 0) {
            effectiveRoomId = rooms[0].id;
        }

        if (!effectiveRoomId) {
            alert("Aucune chambre disponible pour cet hôtel.");
            return;
        }

        try {
            await createReview({
                room_id: effectiveRoomId,
                rating: parseInt(reviewData.rating),
                comment: reviewData.comment
            });

            const newReviewsData = await getHotelReviews(id);
            setReviews(newReviewsData.reviews);
            setStats({
                average: newReviewsData.average_rating || 0,
                count: newReviewsData.total || 0
            });

            // Reset
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
            <div style={{ padding: '100px 0', textAlign: 'center', color: '#C1272D' }}>
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
                    <i className="fa-solid fa-arrow-left"></i> Retour
                </Link>

                {/* Hotel Header */}
                <div className="hotel-header">
                    <h1 className="hotel-title">{hotel.name}</h1>
                    <div className="hotel-meta">
                        <div className="meta-left">
                            <span className="rating-pill">
                                <i className="fa-solid fa-star" style={{ color: '#FFD700' }}></i>
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
                    <img src={resolveImageUrl(hotel.image_url)} alt={hotel.name} className="hero-image" />
                </div>

                {/* Content Grid */}
                <div className="content-grid">

                    {/* Left Column: Info & Details */}
                    <div className="main-content">

                        {/* Host Info */}
                        <div className="host-info-row">
                            <div className="host-text">
                                <h2>Hébergé par {(hotel.owner_name || `Hôte ${hotel.owner_id || ''}`).replace(/Manager/gi, '').trim()}</h2>
                                <p>Superhôte · Réponse rapide</p>
                            </div>
                            <div className="host-avatar">
                                {hotel.owner_picture ? (
                                    <img src={resolveImageUrl(hotel.owner_picture)} alt={hotel.owner_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                ) : (
                                    <i className="fa-solid fa-user"></i>
                                )}
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
                                        <img src={resolveImageUrl(room.image_url)} alt={room.name} className="room-img" />
                                        <div className="room-info">
                                            <h3 className="room-name">{room.name}</h3>
                                            <p className="room-desc">{room.description}</p>
                                            <div className="room-footer">
                                                <span style={{ fontWeight: '600' }}>{room.price_per_night} € <span style={{ fontWeight: '400' }}>nuit</span></span>
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
                                    À partir de {Math.min(...rooms.map(r => r.price_per_night), 0) || 100} € <span className="price-unit">par nuit</span>
                                </span>
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
                                        if (!user) { navigate('/connexion'); return; }
                                        setShowContactModal(true);
                                    }}
                                    className="secondary-btn"
                                    style={{ width: '100%', border: 'none', textDecoration: 'underline', color: '#006233' }}
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
                        <i className="fa-solid fa-star star-big" style={{ color: '#FFD700' }}></i>
                        <h2 className="section-title" style={{ margin: 0 }}>
                            {stats.average.toFixed(2)} · {stats.count} commentaires
                        </h2>
                    </div>

                    <div className="reviews-grid">
                        {/* Inline Review Form for Registered Users */}
                        {user && (
                            <div className="inline-review-form">
                                <h3>Partagez votre expérience</h3>
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
                                    <div className="form-group">
                                        <textarea
                                            placeholder="Qu'avez-vous pensé de cet hôtel ?..." required
                                            rows="3"
                                            className="form-textarea"
                                            value={reviewData.comment}
                                            onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="secondary-btn" style={{ background: '#006233', color: '#fff', border: 'none' }}>
                                        Publier mon avis
                                    </button>
                                </form>
                            </div>
                        )}

                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-user">
                                        <div className="user-pic">
                                            {review.user_picture ? (
                                                <img src={resolveImageUrl(review.user_picture)} alt={review.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                            ) : (
                                                <i className="fa-solid fa-user"></i>
                                            )}
                                        </div>
                                        <div className="user-meta">
                                            <h4>{review.user_name}</h4>
                                            <div className="review-meta-row">
                                                <div className="review-stars-small">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={`fa-star ${i < review.rating ? 'fa-solid' : 'fa-regular'}`} style={{ color: '#FFD700', fontSize: '11px' }}></i>
                                                    ))}
                                                </div>
                                                <span> · {new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-content">
                                        <p className="review-text">
                                            {review.comment}
                                        </p>

                                        {review.reply && (
                                            <div className="hotel-reply" style={{ marginTop: '16px', padding: '16px', background: '#f0f7f2', borderRadius: '12px', borderLeft: '4px solid #006233' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <i className="fa-solid fa-comment-dots" style={{ color: '#006233' }}></i>
                                                    <strong style={{ fontSize: '14px' }}>Réponse de l'établissement</strong>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', color: '#484848' }}>
                                                    "{review.reply}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="room-tag">
                                            {review.room_name || 'Hébergement'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ gridColumn: '1 / -1', color: '#717171' }}>Aucun commentaire pour le moment.</p>
                        )}
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
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Message</label>
                                <textarea
                                    placeholder="Écrivez votre message ici..."
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
