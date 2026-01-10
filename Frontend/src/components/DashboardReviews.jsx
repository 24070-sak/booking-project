import React from 'react';
import { reviewsData, propertiesData } from '../data/mockData';
import '../styles/components/dashboardReviews.css';

const DashboardReviews = () => {
    const getPropertyName = (id) => {
        const prop = propertiesData.find(p => p.id === id);
        return prop ? prop.name : 'Unknown Property';
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

    return (
        <div className="dashboard-content dashboard-reviews-content">
            <h2>Guest Reviews</h2>

            <div className="reviews-list">
                {reviewsData.map(review => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="review-user-info">
                                <div className="user-avatar">
                                    {review.user.charAt(0)}
                                </div>
                                <div className="user-details">
                                    <h4>{review.user}</h4>
                                    <span>Stayed at <strong>{getPropertyName(review.propertyId)}</strong></span>
                                </div>
                            </div>
                            <span className="review-date">{review.date}</span>
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
                ))}
            </div>
        </div>
    );
};

export default DashboardReviews;
