import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/components/header.css'
import SearchBar from "./SearchBar";

function Header() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <div className="header-wrapper">
            <div className="header-top">
                <Link to="/"><img src={logo} alt="logo" className="home-logo" /></Link>
                <div className="labels">
                    <span id="language"><i className="fa-solid fa-earth"></i> FR</span>
                    {user ? (
                        <>
                            {user.access_dashboard && (
                                <Link to="/dashboard" id="login"> <i className="fa-solid fa-gauge"></i> Dashboard</Link>
                            )}

                            <Link to="/profile" style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt="Profile" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                                ) : (
                                    <>
                                        <i className="fa-solid fa-user"></i> {user.first_name}
                                    </>
                                )}
                            </Link>
                            <span onClick={handleLogout} style={{ cursor: 'pointer', color: 'white', marginLeft: '10px' }}> <i className="fa-solid fa-right-from-bracket"></i></span>
                        </>
                    ) : (
                        <Link to="/connexion" id="login"> <i className="fa-solid fa-user"></i> Se connecter</Link>
                    )}
                    <span id="menu"> <i className="fa-solid fa-bars"></i> Menu</span>
                </div>
            </div>

            <div className="header-hero">
                <div className="messages">
                    <h1 className="home-title">
                        Explorez les hotels de Mauritanie
                    </h1>
                    <p className="home-sub-title">
                        Nous comparons les prix des plusieurs hotels
                    </p>
                </div>
                <div className="search-container-header">
                    <SearchBar />
                </div>
            </div>
        </div>
    )
}

export default Header;