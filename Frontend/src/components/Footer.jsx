import React from 'react';
import '../styles/components/footer.css';
import logo from '../assets/logos/logo.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-main">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src={logo} alt="Hotely Logo" />
                            <span>Hotely</span>
                        </div>
                        <p className="footer-description">
                            Découvrez les meilleurs hôtels de Mauritanie.
                            Réservation simple, rapide et sécurisée.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="social-link"><i className="fa-brands fa-twitter"></i></a>
                            <a href="#" className="social-link"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#" className="social-link"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                    </div>

                    <div className="footer-links-group">
                        <div className="footer-column">
                            <h3>Navigation</h3>
                            <ul>
                                <li><a href="#">Accueil</a></li>
                                <li><a href="#">Hôtels</a></li>
                                <li><a href="#">Offres</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Support</h3>
                            <ul>
                                <li><a href="#">Aide & FAQ</a></li>
                                <li><a href="#">Conditions générales</a></li>
                                <li><a href="#">Confidentialité</a></li>
                                <li><a href="#">Politique de cookies</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Contact</h3>
                            <ul className="contact-info">
                                <li><i className="fa-solid fa-phone"></i> +222 32 16 01 26</li>
                                <li><i className="fa-solid fa-envelope"></i> contact@hotely.mr</li>
                                <li><i className="fa-solid fa-location-dot"></i> Nouakchott, Mauritanie</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 Hotely. Tous droits réservés.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Confidentialité</a>
                        <a href="#">Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
