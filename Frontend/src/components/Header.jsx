import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from '../assets/logos/logo.svg'
import '../styles/components/header.css'
import SearchBar from "./SearchBar";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../context/LanguageContext";
import NotificationDropdown from "./NotificationDropdown";

function Header() {
    const [user, setUser] = useState(null);
    const [navOpen, setNavOpen] = useState(false);
    const { t } = useLanguage();
    const navRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const handleOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setNavOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
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

                <div className="labels desktop-labels">
                    <LanguageSelector />
                    {user ? (
                        <>
                            <NotificationDropdown />

                            {user.access_dashboard && (
                                <Link to="/dashboard" id="login">
                                    <i className="fa-solid fa-gauge"></i> {t('dashboard')}
                                </Link>
                            )}

                            {!user.access_dashboard && (
                                <Link to="/messages" className="messages-btn" title={t('messages')}>
                                    <i className="fa-solid fa-comment-dots"></i>
                                    <span>{t('messages')}</span>
                                </Link>
                            )}

                            <Link to="/profile" className="user-profile-link">
                                {user.profile_picture && user.profile_picture !== 'null' && user.profile_picture !== 'undefined' ? (
                                    <>
                                        <img 
                                            src={user.profile_picture} 
                                            alt="" 
                                            className="header-profile-pic" 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="header-profile-placeholder" style={{ display: 'none' }}>
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                    </>
                                ) : (
                                    <div className="header-profile-placeholder">
                                        <i className="fa-solid fa-user"></i>
                                    </div>
                                )}
                                <span className="user-name">{user.first_name}</span>
                            </Link>

                            <span onClick={handleLogout} className="logout-btn" title={t('logout')}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </span>
                        </>
                    ) : (
                        <Link to="/connexion" id="login">
                            <i className="fa-solid fa-user"></i> {t('login')}
                        </Link>
                    )}
                </div>

                <div className="mobile-header-right">
                    <LanguageSelector />

                    {user ? (
                        <>
                            <Link to="/profile" className="mobile-profile-chip">
                                {user.profile_picture && user.profile_picture !== 'null' && user.profile_picture !== 'undefined' ? (
                                    <>
                                        <img 
                                            src={user.profile_picture} 
                                            alt="" 
                                            className="header-profile-pic" 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="header-profile-placeholder" style={{ display: 'none' }}>
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                    </>
                                ) : (
                                    <div className="header-profile-placeholder">
                                        <i className="fa-solid fa-user"></i>
                                    </div>
                                )}
                                <span className="mobile-user-name">{user.first_name}</span>
                            </Link>

                            <div className="nav-toggle-wrapper" ref={navRef}>
                                <button
                                    className={`nav-toggle-btn${navOpen ? ' active' : ''}`}
                                    onClick={() => setNavOpen(prev => !prev)}
                                    aria-label="Menu"
                                >
                                    <span className="nav-toggle-bar"></span>
                                    <span className="nav-toggle-bar"></span>
                                    <span className="nav-toggle-bar"></span>
                                </button>

                                {navOpen && (
                                    <div className="nav-dropdown">
                                        <div className="nav-dropdown-header">
                                            {user.profile_picture && user.profile_picture !== 'null' && user.profile_picture !== 'undefined' ? (
                                                <>
                                                    <img 
                                                        src={user.profile_picture} 
                                                        alt="" 
                                                        className="nav-dropdown-avatar" 
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="nav-dropdown-avatar-placeholder" style={{ display: 'none' }}>
                                                        <i className="fa-solid fa-user"></i>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="nav-dropdown-avatar-placeholder">
                                                    <i className="fa-solid fa-user"></i>
                                                </div>
                                            )}
                                            <div className="nav-dropdown-user-info">
                                                <span className="nav-dropdown-fullname">{user.first_name} {user.last_name}</span>
                                                <span className="nav-dropdown-role">
                                                    {user.access_dashboard ? 'Administrateur' : 'Membre'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="nav-dropdown-divider"></div>

                                        <Link to="/notifications" className="nav-dropdown-link" onClick={() => setNavOpen(false)}>
                                            <span className="nav-dropdown-icon notifications-icon">
                                                <i className="fa-solid fa-bell"></i>
                                            </span>
                                            <span className="nav-dropdown-link-title">Notifications</span>
                                            <i className="fa-solid fa-chevron-right nav-dropdown-arrow"></i>
                                        </Link>

                                        {user.access_dashboard && (
                                            <Link to="/dashboard" className="nav-dropdown-link" onClick={() => setNavOpen(false)}>
                                                <span className="nav-dropdown-icon">
                                                    <i className="fa-solid fa-gauge"></i>
                                                </span>
                                                <span className="nav-dropdown-link-title">Tableau de bord</span>
                                                <i className="fa-solid fa-chevron-right nav-dropdown-arrow"></i>
                                            </Link>
                                        )}

                                        {!user.access_dashboard && (
                                            <Link to="/messages" className="nav-dropdown-link" onClick={() => setNavOpen(false)}>
                                                <span className="nav-dropdown-icon">
                                                    <i className="fa-solid fa-comment-dots"></i>
                                                </span>
                                                <span className="nav-dropdown-link-title">{t('messages')}</span>
                                                <i className="fa-solid fa-chevron-right nav-dropdown-arrow"></i>
                                            </Link>
                                        )}

                                        <div className="nav-dropdown-divider"></div>

                                        <button className="nav-dropdown-link nav-dropdown-logout"
                                            onClick={() => { handleLogout(); setNavOpen(false); }}>
                                            <span className="nav-dropdown-icon logout-icon">
                                                <i className="fa-solid fa-right-from-bracket"></i>
                                            </span>
                                            <span className="nav-dropdown-link-title">{t('logout')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link to="/connexion" className="nav-login-btn">
                            <i className="fa-solid fa-user"></i>
                            <span>{t('login')}</span>
                        </Link>
                    )}
                </div>

            </div>

            <div className="header-hero">
                <div className="messages">
                    <h1 className="home-title">{t('explore')}</h1>
                    <p className="home-sub-title">{t('compare')}</p>
                </div>
                <div className="search-container-header">
                    <SearchBar />
                </div>
            </div>
        </div>
    );
}

export default Header;