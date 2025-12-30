import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/components/header.css'
import SearchBar from "./SearchBar";

function Header() {
    return (
        <div className="header-wrapper">
            <div className="header-top">
                <Link to="/"><img src={logo} alt="logo" className="home-logo" /></Link>
                <div className="labels">
                    <span id="language"><i className="fa-solid fa-earth"></i> FR</span>
                    <Link to="/connexion" id="login"> <i className="fa-solid fa-user"></i> Se connecter</Link>
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