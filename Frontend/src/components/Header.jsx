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
                    {user ? (
                        <>
                            {user.access_dashboard && (
                                <Link to="/dashboard" id="login"> <i className="fa-solid fa-gauge"></i> Dashboard</Link>
                            )}

                            {!user.access_dashboard && (
                                <Link to="/messages" className="messages-btn" title="Messages">
                                    <i className="fa-solid fa-comment-dots"></i>
                                </Link>
                            )}

                            <Link to="/profile" className="user-profile-link">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt="Profile" className="header-profile-pic" />
                                ) : (
                                    <div className="header-profile-placeholder">
                                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                                <span className="user-name">{user.first_name}</span>
                            </Link>

                            <span onClick={handleLogout} className="logout-btn" title="Se déconnecter">
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </span>
                        </>
                    ) : (
                        <Link to="/connexion" id="login"> <i className="fa-solid fa-user"></i> Se connecter</Link>
                    )}
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