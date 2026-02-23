import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from '../assets/logos/logo.svg'
import '../styles/components/header.css'
import SearchBar from "./SearchBar";

import LanguageSelector from "./LanguageSelector";

import { useLanguage } from "../context/LanguageContext";

function Header() {
    const [user, setUser] = useState(null);
    const { t } = useLanguage();

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
                    <LanguageSelector />
                    {user ? (
                        <>
                            {user.access_dashboard && (
                                <Link to="/dashboard" id="login"> <i className="fa-solid fa-gauge"></i> {t('dashboard')}</Link>
                            )}

                            {!user.access_dashboard && (
                                <Link to="/messages" className="messages-btn" title={t('messages')}>
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

                            <span onClick={handleLogout} className="logout-btn" title={t('logout')}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </span>
                        </>
                    ) : (
                        <Link to="/connexion" id="login"> <i className="fa-solid fa-user"></i> {t('login')}</Link>
                    )}
                </div>
            </div>

            <div className="header-hero">
                <div className="messages">
                    <h1 className="home-title">
                        {t('explore')}
                    </h1>
                    <p className="home-sub-title">
                        {t('compare')}
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