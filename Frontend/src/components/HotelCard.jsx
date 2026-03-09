const API = import.meta.env.VITE_API_URL || "";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/urlHelper";
import '../styles/components/hotelCard.css'

function HotelCard({ id, title, location, price, imageUrl, rating, dateAvailable }) {

    // Fire-and-forget: increment hotel view count when clicked
    const handleViewClick = () => {
        const isUnique = !sessionStorage.getItem(`viewed_hotel_${id}`);
        if (isUnique) {
            sessionStorage.setItem(`viewed_hotel_${id}`, '1');
        }
        fetch(`${API}/api/hotels/${id}?unique=${isUnique}`, { method: 'GET' }).catch(() => {});
    };

    return (
        <div className="Card">
            <div className="card-image-wrapper">
                <img src={resolveImageUrl(imageUrl)} alt={title} className="card-image" />
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
                <Link to={`/hotel/${id}`} className="card-button-link" onClick={handleViewClick}>
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