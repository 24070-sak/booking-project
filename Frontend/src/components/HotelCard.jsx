const API = import.meta.env.VITE_API_URL || "";
import { Link } from "react-router-dom";
import '../styles/components/hotelCard.css'


function HotelCard({ id, title, location, price, imageUrl, rating, dateAvailable }) {
    return (
        <div className="Card">
            <img src={imageUrl} alt={title} className="card-image" />
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-location"><i className="fa-solid fa-location-dot"></i> {location}</p>
                <p className="card-price">{price}</p>
                <p className="card-date">{dateAvailable}</p>
                <div className="card-rating">
                    Av. Note {rating} ⭐
                </div>
                <Link to={`/hotel/${id}`} className="card-button-link">
                    <button className="card-button">
                        Voir plus
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </Link>
            </div>
        </div>

    )
}
export default HotelCard;