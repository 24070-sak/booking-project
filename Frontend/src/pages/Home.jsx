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
import LoadingSpinner from "../components/LoadingSpinner";

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
                    </div>

                    {loading && (
                        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                            <LoadingSpinner text={t('loading_offers')} />
                        </div>
                    )}
                    {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                    <div className="hotels-grid" key={offset}>
                        {hotels.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                id={hotel.id}
                                title={hotel.name.replace(/Manager/gi, '').trim()}
                                location={hotel.location}
                                price={hotel.lowest_price ? `${t('from')} ${hotel.lowest_price} €` : t('price_unavailable')}
                                imageUrl={hotel.image_url}
                                rating={hotel.rating}
                                dateAvailable={hotel.has_availability ? t('available') : t('full')}
                            />
                        ))}
                    </div>

                    {!loading && (hotels.length > 0 || offset > 0) && (
                        <div className="pagination-container">
                            <button
                                className="pagination-btn"
                                onClick={handlePrev}
                                disabled={offset === 0}
                            >
                                <i className="fa-solid fa-arrow-left"></i> {t('previous')}
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={handleNext}
                                disabled={(offset + limit) >= total}
                            >
                                {t('more')} <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    )}
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