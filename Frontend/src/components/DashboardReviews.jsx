import React, { useState, useEffect } from 'react';
import { getReviews } from '../services/dashboardService';
import { replyToReview } from '../services/reviewService';
import '../styles/components/dashboardReviews.css';

const DashboardReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getReviews();
            setReviews(data.reviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;
        try {
            await replyToReview(reviewId, replyText);
            alert("Réponse envoyée !");
            setReplyingTo(null);
            setReplyText("");
            fetchReviews();
        } catch (error) {
            alert("Erreur: " + error.message);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<i key={i} className="fa-solid fa-star star-filled"></i>);
            } else {
                stars.push(<i key={i} className="fa-regular fa-star star-empty"></i>);
            }
        }
        return stars;
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="dashboard-content dashboard-reviews-content">
            <h2>Avis des Clients</h2>

            <div className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-user-info">
                                    <div className="user-avatar">
                                        {review.user_picture ? (
                                            <img src={review.user_picture} alt={review.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        ) : (
                                            <i className="fa-solid fa-user"></i>
                                        )}
                                    </div>
                                    <div className="user-details">
                                        <h4>{review.user_name}</h4>
                                        <span>Séjourné à <strong>{review.hotel_name}</strong></span>
                                    </div>
                                </div>
                                <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="review-rating">
                                {renderStars(review.rating)}
                                <span className="rating-number">{review.rating}.0</span>
                            </div>

                            <p className="review-comment">"{review.comment}"</p>

                            <div className="review-actions">

                                {replyingTo === review.id ? (
                                    <div className="reply-form">
                                        <textarea
                                            placeholder="Écrire votre réponse..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleReply(review.id)}>Envoyer</button>
                                            <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setReplyingTo(null)}>Annuler</button>
                                        </div>
                                    </div>
                                ) : review.reply ? (
                                    <div className="current-reply">
                                        <strong>Votre réponse :</strong>
                                        <p>{review.reply}</p>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            <button className="btn-reply-small" onClick={() => { setReplyingTo(review.id); setReplyText(""); }}>
                                                Nouvelle réponse
                                            </button>
                                            <button className="btn-reply-small" onClick={() => { setReplyingTo(review.id); setReplyText(review.reply); }}>
                                                Modifier la réponse
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button className="btn-reply" onClick={() => setReplyingTo(review.id)}>
                                        <i className="fa-solid fa-reply"></i> Répondre
                                    </button>
                                )}
                            </div>
                        </div>

                    ))
                ) : (
                    <p>Aucun avis pour le moment.</p>
                )}
            </div>
        </div >
    );
};

export default DashboardReviews;
