import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL || "";
import { getAllHotels } from "../services/hotelService";
import logo from '../assets/logos/logo.svg'
import '../styles/pages/home.css'
import Header from "../components/Header";
import HotelCard from "../components/HotelCard";
import bed from '../assets/imgs/bed.png'
import shield from '../assets/imgs/shield.png'
import search from '../assets/imgs/search.png'
import Footer from "../components/Footer";

import { useLanguage } from "../context/LanguageContext";

function Home() {
    const { t } = useLanguage();
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
    const minPriceQuery = searchParams.get('min_price') || '';
    const maxPriceQuery = searchParams.get('max_price') || '';
    const locationQuery = searchParams.get('location') || '';
    const minRatingQuery = searchParams.get('min_rating') || '';

    const fetchHotels = async (currentOffset) => {
        setLoading(true);
        try {
            const data = await getAllHotels(limit, currentOffset, searchQuery, guestsQuery, checkInQuery, checkOutQuery, minPriceQuery, maxPriceQuery, locationQuery, minRatingQuery);
            if (data.hotels) {
                setHotels(data.hotels);
                setTotal(data.total);
            }
        } catch (err) {
            console.error("Erreur chargement hotels:", err);
            setError(t('error_loading_hotels'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setOffset(0); // Reset offset on new search
        fetchHotels(0);
    }, [searchQuery, guestsQuery, checkInQuery, checkOutQuery, minPriceQuery, maxPriceQuery, locationQuery, minRatingQuery]);

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
                        <h2>{t('home_offers_title')}</h2>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            {offset > 0 && !loading && (
                                <p onClick={handlePrev} style={{ cursor: 'pointer', color: '#0b6ad6', fontWeight: 'bold' }}>
                                    <i className="fa-solid fa-arrow-left"></i> {t('previous')}
                                </p>
                            )}
                            {(offset + limit) < total && !loading && (
                                <p onClick={handleNext} style={{ cursor: 'pointer', color: '#0b6ad6', fontWeight: 'bold' }}>
                                    {t('more')} <i className="fa-solid fa-arrow-right"></i>
                                </p>
                            )}
                        </div>
                    </div>

                    {loading && <p style={{ textAlign: 'center' }}>{t('loading_offers')}</p>}
                    {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                    <div className="hotels-grid">
                        {hotels.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                id={hotel.id}
                                title={hotel.name}
                                location={hotel.location}
                                price={hotel.lowest_price ? `${t('from')} ${hotel.lowest_price} €` : t('price_unavailable')}
                                imageUrl={hotel.image_url}
                                rating={hotel.rating}
                                dateAvailable={hotel.has_availability ? t('available') : t('full')}
                            />
                        ))}
                    </div>
                </div>
                <div className="our-logos">
                    <div className="logo-item">
                        <img src={bed} alt="Bed Icon" />
                        <span>{t('save_big')}</span>
                        <p>{t('save_big_desc')}</p>
                    </div>
                    <div className="logo-item">
                        <img src={shield} alt="Shield Icon" />
                        <span>{t('reliable_service')}</span>
                        <p>{t('reliable_service_desc')}</p>
                    </div>
                    <div className="logo-item">
                        <img src={search} alt="Search Icon" />
                        <span>{t('simple_search')}</span>
                        <p>{t('simple_search_desc')}</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default Home;