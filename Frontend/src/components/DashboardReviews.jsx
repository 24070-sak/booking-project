import React, { useState, useEffect } from 'react';
import { getReviews } from '../services/dashboardService';
import '../styles/components/dashboardReviews.css';

const DashboardReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const data = await getReviews();
                setReviews(data.reviews);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

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
            <h2>Guest Reviews</h2>

            <div className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-user-info">
                                    <div className="user-avatar">
                                        {review.user_name.charAt(0)}
                                    </div>
                                    <div className="user-details">
                                        <h4>{review.user_name}</h4>
                                        <span>Stayed at <strong>{review.hotel_name}</strong></span>
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
                                <button className="btn-reply">
                                    <i className="fa-solid fa-reply"></i> Reply
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Aucun avis pour le moment.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardReviews;
