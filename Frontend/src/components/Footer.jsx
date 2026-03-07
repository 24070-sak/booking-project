import React from 'react';
import '../styles/components/footer.css';
import logo from '../assets/logos/logo.svg';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-main">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src={logo} alt="Hotely Logo" />
                        </div>
                        <p className="footer-description">
                            {t('footer_desc')}
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
                            <h3>{t('navigation')}</h3>
                            <ul>
                                <li><a href="#">{t('home')}</a></li>
                                <li><a href="#">{t('hotels')}</a></li>
                                <li><a href="#">{t('offers')}</a></li>
                                <li><a href="#">{t('contact')}</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>{t('support')}</h3>
                            <ul>
                                <li><a href="#">{t('help_faq')}</a></li>
                                <li><a href="#">{t('terms_conditions')}</a></li>
                                <li><a href="#">{t('privacy')}</a></li>
                                <li><a href="#">{t('cookie_policy')}</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>{t('contact')}</h3>
                            <ul className="contact-info">
                                <li><i className="fa-solid fa-phone"></i> +222 32 16 01 26</li>
                                <li><i className="fa-solid fa-envelope"></i> contact@hotely.mr</li>
                                <li><i className="fa-solid fa-location-dot"></i> Nouakchott, Mauritanie</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 Hotely. {t('all_rights_reserved')}</p>
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
