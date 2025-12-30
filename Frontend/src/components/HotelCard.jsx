const API = import.meta.env.VITE_API_URL || "";
import { useState, useEffect } from "react";
import '../styles/components/hotelCard.css'


function HotelCard({ title, location, price, imageUrl, rating, dateAvailable }) {
    return (
        <div className="Card">
            <img src={imageUrl} alt={title} className="card-image" />
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-location">{location}</p>
                <p className="card-price">{price}</p>
                <p className="card-date">{dateAvailable}</p>
                <div className="card-rating">
                    {rating}
                </div>
                <button className="card-button">
                    Voir plus
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>

    )
}
export default HotelCard;