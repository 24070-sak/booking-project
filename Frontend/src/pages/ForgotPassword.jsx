import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import "../styles/pages/login.css";
import logo from "../assets/logos/logo.svg";

function ForgotPassword() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            await resetPassword(email);
            setMessage(t('reset_link_sent'));
        } catch (err) {
            setError(err.message || t('reset_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <div className="login-container">
                <div className="login-header">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="login-subtitle">{t('reset_password_title')}</h2>
                </div>

                {error && <div style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</div>}
                {message && <div style={{ color: "green", textAlign: "center", marginBottom: "10px" }}>{message}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div>
                        <label className="form-label" htmlFor="email">
                            {t('email')}
                        </label>
                        <div className="input-container">
                            <i className="fa-solid fa-envelope"></i>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder={t('insert_email')}
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-button" style={{ marginTop: '20px' }} disabled={loading}>
                        {loading ? t('sending') : t('send_link')}
                    </button>
                </form>

                <div className="line" style={{ marginTop: "30px" }}>
                    <hr />
                    <span>{t('or')}</span>
                    <hr />
                </div>

                <p id="note" style={{ marginTop: "20px" }}>
                    <span id="createAccount">
                        <Link to="/connexion">⬅ {t('back_to_login')}</Link>
                    </span>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
