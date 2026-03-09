const API = import.meta.env.VITE_API_URL || "";
import { Link } from "react-router-dom";
import '../styles/components/hotelCard.css'


function HotelCard({ id, title, location, price, imageUrl, rating, dateAvailable }) {
    return (
        <div className="Card">
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={title} className="card-image" />
                <div className="card-rating">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(rating) ? 'star filled' : 'star empty'}>
                            {i < Math.round(rating) ? '★' : '☆'}
                        </span>
                    ))}
                </div>
            </div>
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-location"><i className="fa-solid fa-location-dot"></i> {location}</p>
                <p className="card-price">{price}</p>
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