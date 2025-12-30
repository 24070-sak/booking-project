import { Link } from "react-router-dom";
const API = import.meta.env.VITE_API_URL || "";
import { useState, useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/components/header.css'


function Header() {
    return (
        <div className="header">
            <Link to="/"><img src={logo} alt="logo" className="home-logo" /></Link>
            <div className="labels">
                <span id="language"><i className="fa-solid fa-earth"></i> FR</span>
                <Link to="/connexion" id="login"> <i className="fa-solid fa-user"></i> Se connecter</Link>
                <span id="menu"> <i className="fa-solid fa-bars"></i> Menu</span>
            </div>
        </div>

    )
}
export default Header;