import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import '../styles/components/searchBar.css';
import { useLanguage } from "../context/LanguageContext";

function SearchBar() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [location, setLocation] = useState(searchParams.get('location') || "");
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || "");
    const [minRating, setMinRating] = useState(searchParams.get('min_rating') || "");

    useEffect(() => {
        setLocation(searchParams.get('location') || "");
        setMinPrice(searchParams.get('min_price') || "");
        setMaxPrice(searchParams.get('max_price') || "");
        setMinRating(searchParams.get('min_rating') || "");
    }, [searchParams]);

    const handleApplyFilters = () => {
        const params = new URLSearchParams(searchParams);
        if (location) params.set('location', location); else params.delete('location');
        if (minPrice) params.set('min_price', minPrice); else params.delete('min_price');
        if (maxPrice) params.set('max_price', maxPrice); else params.delete('max_price');
        if (minRating) params.set('min_rating', minRating); else params.delete('min_rating');

        setIsOpen(false);
        navigate(`/?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setLocation('');
        setMinPrice('');
        setMaxPrice('');
        setMinRating('');
    };

    return (
        <div className="filter-container">
            <button className="beautiful-filter-btn" onClick={() => setIsOpen(!isOpen)}>
                <i className="fa-solid fa-sliders"></i> {t ? t('filter', { defaultValue: 'Filtrer' }) : 'Filtrer'}
            </button>

            {isOpen && (
                <div className="filter-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="filter-modal" onClick={e => e.stopPropagation()}>
                        <div className="filter-header">
                            <h3><i className="fa-solid fa-filter"></i> Filtres</h3>
                            <button className="close-filter" onClick={() => setIsOpen(false)}>&times;</button>
                        </div>

                        <div className="filter-body">
                            <div className="filter-group">
                                <label><i className="fa-solid fa-location-dot"></i> Emplacement</label>
                                <input
                                    type="text"
                                    placeholder="Ville, hôtel..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div className="filter-group">
                                <label><i className="fa-solid fa-money-bill-wave"></i> Prix (€)</label>
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        min="0"
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label><i className="fa-solid fa-star"></i> Note minimale</label>
                                <select value={minRating} onChange={e => setMinRating(e.target.value)}>
                                    <option value="">Toutes les notes</option>
                                    <option value="1">1+ Étoile</option>
                                    <option value="2">2+ Étoiles</option>
                                    <option value="3">3+ Étoiles</option>
                                    <option value="4">4+ Étoiles</option>
                                    <option value="5">5 Étoiles</option>
                                </select>
                            </div>
                        </div>

                        <div className="filter-footer">
                            <button className="btn-clear" onClick={handleClearFilters}>Effacer</button>
                            <button className="btn-apply" onClick={handleApplyFilters}>Appliquer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchBar;