import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL || "";
import { getAllHotels } from "../services/hotelService";
import logo from '../assets/logos/logo.png'
import '../styles/pages/home.css'
import Header from "../components/Header";
import HotelCard from "../components/HotelCard";
import bed from '../assets/imgs/bed.png'
import shield from '../assets/imgs/shield.png'
import search from '../assets/imgs/search.png'
import Footer from "../components/Footer";

function Home() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    const limit = 5;

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const guestsQuery = searchParams.get('guests') || 0;
    const checkInQuery = searchParams.get('check_in') || '';
    const checkOutQuery = searchParams.get('check_out') || '';

    const fetchHotels = async (currentOffset) => {
        setLoading(true);
        try {
            const data = await getAllHotels(limit, currentOffset, searchQuery, guestsQuery, checkInQuery, checkOutQuery);
            if (data.hotels) {
                setHotels(data.hotels);
                setTotal(data.total);
            }
        } catch (err) {
            console.error("Erreur chargement hotels:", err);
            setError("Impossible de charger les hôtels.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setOffset(0); // Reset offset on new search
        fetchHotels(0);
    }, [searchQuery, guestsQuery, checkInQuery, checkOutQuery]);

    const handleNext = () => {
        const newOffset = offset + limit;
        if (newOffset < total) {
            setOffset(newOffset);
            fetchHotels(newOffset);
        }
    };

    const handlePrev = () => {
        const newOffset = offset - limit;
        if (newOffset >= 0) {
            setOffset(newOffset);
            fetchHotels(newOffset);
        }
    };

    return (
        <div className="home-body">
            <div className="home-container">
                <Header />
                <div className="card-container">
                    <div className="paragraphe">
                        <h2>Offres des hotels en ce moment</h2>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            {offset > 0 && !loading && (
                                <p onClick={handlePrev} style={{ cursor: 'pointer', color: '#0b6ad6', fontWeight: 'bold' }}>
                                    <i className="fa-solid fa-arrow-left"></i> Voir précédent
                                </p>
                            )}
                            {(offset + limit) < total && !loading && (
                                <p onClick={handleNext} style={{ cursor: 'pointer', color: '#0b6ad6', fontWeight: 'bold' }}>
                                    Voir plus <i className="fa-solid fa-arrow-right"></i>
                                </p>
                            )}
                        </div>
                    </div>

                    {loading && <p style={{ textAlign: 'center' }}>Chargement des offres...</p>}
                    {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                    <div className="hotels-grid">
                        {hotels.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                id={hotel.id}
                                title={hotel.name}
                                location={hotel.location}
                                price={hotel.lowest_price ? `dès ${hotel.lowest_price} MRU` : 'Prix indisponible'}
                                imageUrl={hotel.image_url}
                                rating={hotel.rating}
                                dateAvailable={hotel.has_availability ? "Disponible" : "Complet"}
                            />
                        ))}
                    </div>
                </div>
                <div className="our-logos">
                    <div className="logo-item">
                        <img src={bed} alt="Bed Icon" />
                        <span>Economisez gros</span>
                        <p>Economisez gros sur vos reservations Proftez des meilleures offres des maintenant! </p>
                    </div>
                    <div className="logo-item">
                        <img src={shield} alt="Shield Icon" />
                        <span>Fiable service</span>
                        <p>Profitez d’un service fiable à chaque réservation Votre confiance est notre priorité </p>
                    </div>
                    <div className="logo-item">
                        <img src={search} alt="Search Icon" />
                        <span>Simple Recherche</span>
                        <p>Recherche simple et intuitive pour trouver votre hotel parfait</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default Home;