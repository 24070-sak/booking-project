import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, googleLogin, socialLoginSync } from "../services/authService";
import { signInWithGoogle, signInWithFacebook } from "../services/firebase";
import "../styles/pages/register.css";
import logo from "../assets/logos/logo.svg";
import google from "../assets/logos/google.png";
import facebook from "../assets/logos/facebook.png";
import { useLanguage } from "../context/LanguageContext";

function Register() {
  const { t } = useLanguage();
  const [showPsswd, setShowPsswd] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, text: "", color: "#e2e8f0" };

    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, text: t('weak', 'Faible'), color: "#ef4444" };
      case 2:
        return { score: 50, text: t('medium', 'Moyen'), color: "#f59e0b" };
      case 3:
        return { score: 75, text: t('strong', 'Fort'), color: "#10b981" };
      case 4:
        return { score: 100, text: t('very_strong', 'Très Fort'), color: "#006233" };
      default:
        return { score: 0, text: "", color: "#e2e8f0" };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const value = e.target.name === 'email' ? e.target.value.trim() : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // التحقق من الطول (الذي أضفناه)
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
      };

      const data = await register(userData);

      if (data.email_verification_required) {
        // Pass email as query param so EmailVerification.jsx can read it
        navigate(`/verification?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.access_token);

      if (data.user.access_dashboard) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSocialLogin = async (platform) => {
    try {
      setLoading(true);
      setError("");
      let firebaseUser;

      if (platform === 'Google') {
        const { user } = await signInWithGoogle();
        firebaseUser = user;
      } else if (platform === 'Facebook') {
        const { user } = await signInWithFacebook();
        firebaseUser = user;
      }

      if (firebaseUser) {
        // Google uses dedicated /api/auth/google endpoint
        const data = platform === 'Google'
          ? await googleLogin(firebaseUser)
          : await socialLoginSync(firebaseUser);

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.access_token);

        // Redirect to dashboard if user has access, otherwise home
        if (data.user?.access_dashboard) {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err);
      setError(`Erreur lors de la connexion ${platform}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="register-container">
        {/* HEADER */}
        <div className="register-header">
          <img className="register-logo" src={logo} alt="logo" />
          <h2 className="register-title">{t('register_title')}</h2>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

        {/* FORM */}
        <form className="register-form" onSubmit={handleSubmit}>

          <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
            {/* PRENOM */}
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="firstName">
                {t('firstname')}
              </label>
              <div className="input-container">
                <i className="fa-solid fa-user"></i>
                <input
                  id="firstName"
                  type="text"
                  className="form-input"
                  placeholder={t('firstname')}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* NOM */}
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="lastName">
                {t('lastname')}
              </label>
              <div className="input-container">
                <i className="fa-solid fa-user"></i>
                <input
                  id="lastName"
                  type="text"
                  className="form-input"
                  placeholder={t('lastname')}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t('email')}
            </label>
            <div className="input-container">
              <i className="fa-solid fa-envelope"></i>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder={t('email')}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* TELEPHONE */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              {t('phone')}
            </label>
            <div className="input-container">
              <i className="fa-solid fa-phone"></i>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder={t('phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* MOT DE PASSE */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t('password')}
            </label>
            <div className="input-container">
              <i className="fa-solid fa-lock"></i>
              <input
                id="password"
                type={showPsswd ? "text" : "password"}
                className="form-input"
                placeholder={t('password')}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <i
                className={`fa-solid ${showPsswd ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                onClick={() => setShowPsswd(!showPsswd)}
                style={{ cursor: "pointer" }}
                id="toggle"
              ></i>
            </div>
            {formData.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', padding: '0 4px' }}>
                <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '4px',
                        backgroundColor: strength.score >= step * 25 ? strength.color : '#e2e8f0',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: strength.color, transition: 'all 0.3s ease' }}>
                  {strength.text}
                </span>
              </div>
            )}
          </div>

          {/* CONFIRMATION MOT DE PASSE */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              {t('confirm_password')}
            </label>
            <div className="input-container">
              <i className="fa-solid fa-lock"></i>
              <input
                id="confirmPassword"
                type={showPsswd ? "text" : "password"}
                className="form-input"
                placeholder={t('confirm_password')}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <i
                className={`fa-solid ${showPsswd ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                onClick={() => setShowPsswd(!showPsswd)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? t('registering') : t('register_button')}
          </button>
        </form>

        <div className="line">
          <hr />
          <span>{t('or')}</span>
          <hr />
        </div>

        {/* SOCIAL LOGIN */}
        <div className="social-login">
          <div className="login-google" onClick={() => handleSocialLogin('Google')}>
            <img src={google} alt="google icon" />
            <p>{t('register_google')}</p>
          </div>

          <div className="login-facebook" onClick={() => handleSocialLogin('Facebook')}>
            <img src={facebook} alt="facebook icon" />
            <p>{t('register_facebook')}</p>
          </div>
        </div>
        <p id="note">{t('already_have_account')} <span id="createAccount"><Link to="/connexion">{t('login')}</Link></span></p>
      </div>
    </div>
  );
}

export default Register;
