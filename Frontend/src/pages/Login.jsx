import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin, socialLoginSync } from "../services/authService";
import { signInWithGoogle, signInWithFacebook } from "../services/firebase";
import '../styles/pages/login.css'
import logo from '../assets/logos/logo.svg'
import google from '../assets/logos/google.png'
import facebook from '../assets/logos/facebook.png'
import { useLanguage } from "../context/LanguageContext";

function Login() {
  const { t } = useLanguage();
  const [showPsswd, setShowPsswd] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);

      if (data.email_verification_required) {
        navigate("/verification", { state: { email: formData.email } });
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.access_token);
      
      // Notify other components of auth change
      window.dispatchEvent(new Event('authChange'));

      if (data.user?.access_dashboard) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.message.includes("Vérifiez")) {
        navigate("/verification", { state: { email: formData.email } });
      } else {
        setError(err.message);
      }
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
        
        // Notify other components of auth change
        window.dispatchEvent(new Event('authChange'));

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
      <div className="login-container">

        <div className="login-header">
          <img className="logo" src={logo} alt="logo" />
          <h2 className="login-subtitle">{t('login_title')}</h2>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

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
                placeholder={t('email')}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
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
                id="togglePassword"
              ></i>
            </div>
            <span className="forgot-password">
              {/* Support both routes */}
              <Link to="/mot-de-passe-oublie"><span>{t('forgot_password')}</span></Link>
            </span>
          </div>

          <button type="submit" className="login-button" name="login" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {loading ? (
                <>
                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    {t('logging_in')}
                </>
            ) : t('login_button')}
          </button>
        </form>

        <div className="line">
          <hr />
          <span>{t('or')}</span>
          <hr />
        </div>

        <div className="social-login">
          <div className="login-google" onClick={() => handleSocialLogin('Google')} style={{ cursor: 'pointer' }}>
            <img src={google} alt="google icon" />
            <p>{t('login_google')}</p>
          </div>

          <div className="login-facebook" onClick={() => handleSocialLogin('Facebook')} style={{ cursor: 'pointer' }}>
            <img src={facebook} alt="facebook icon" />
            <p>{t('login_facebook')}</p>
          </div>
        </div>

        <p id="note">{t('no_account')} <span id="createAccount"><Link to="/inscription">{t('create_account')}</Link></span></p>
      </div>
    </div>
  );
}

export default Login;
