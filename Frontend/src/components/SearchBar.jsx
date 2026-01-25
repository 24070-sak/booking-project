import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/components/searchBar.css'

function SearchBar() {
    const [destination, setDestination] = useState("");
    const [guests, setGuests] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const navigate = useNavigate();

    const handleSearch = () => {
        // Build query string
        const params = new URLSearchParams();
        if (destination) params.append('search', destination);
        if (guests) params.append('guests', guests);
        if (checkIn) params.append('check_in', checkIn);
        if (checkOut) params.append('check_out', checkOut);

        navigate(`/?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-bar">
            <div className="search-input-group">
                <i className="fa-solid fa-bed search-icon"></i>
                <input
                    type="text"
                    placeholder="Destination, hôtel ou chambre"
                    className="search-input"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="search-divider"></div>

            <div className="search-input-group" style={{ gap: '5px' }}>
                <i className="fa-solid fa-calendar-days search-icon"></i>
                <input
                    type="text"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => e.target.type = 'text'}
                    placeholder="Arrivée"
                    className="search-input"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={{ minWidth: 'auto' }}
                />
                <span style={{ color: '#ccc' }}>-</span>
                <input
                    type="text"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => e.target.type = 'text'}
                    placeholder="Départ"
                    className="search-input"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{ minWidth: 'auto' }}
                />
            </div>

            <div className="search-divider"></div>

            <div className="search-input-group">
                <i className="fa-solid fa-user-group search-icon"></i>
                <input
                    type="number"
                    min="1"
                    placeholder="Voyageurs"
                    className="search-input"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <button className="search-button" onClick={handleSearch}>
                <i className="fa-solid fa-magnifying-glass"></i> Rechercher
            </button>
        </div>
    )
}
export default SearchBar;