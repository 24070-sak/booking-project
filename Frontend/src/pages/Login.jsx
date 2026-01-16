import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import '../styles/pages/login.css'
import logo from '../assets/logos/logo.png'
import google from '../assets/logos/google.png'
import facebook from '../assets/logos/facebook.png'

function Login() {
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
      // Stocker le token
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.access_token);

      // Rediriger vers le dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="login-container">

        <div className="login-header">
          <img className="logo" src={logo} alt="logo" />
          <h2 className="login-subtitle">Connexion</h2>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>

          <div>
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="input-container">
              <i className="fa-solid fa-envelope"></i>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="password">
              Mot de passe
              <span className="forgot-password">
                <Link to="#"><span>Mot de passe oublié ?</span></Link>
              </span>
            </label>
            <div className="input-container">
              <i className="fa-solid fa-lock"></i>
              <input
                id="password"
                type={showPsswd ? "text" : "password"}
                className="form-input"
                placeholder="Mot de passe"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <i className={`fa-solid ${showPsswd ? "fa-eye-slash" : "fa-eye"}`}
                id="togglePassword"
                onClick={() => setShowPsswd(!showPsswd)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
          </div>

          <button type="submit" className="login-button" name="login" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="line">
          <hr />
          <span>ou</span>
          <hr />
        </div>

        <div className="social-login">
          <div className="login-google">
            <img src={google} alt="google icon" />
            <p>Se connecter avec google</p>
          </div>

          <div className="login-facebook">
            <img src={facebook} alt="facebook icon" />
            <p>Se connecter avec facebook</p>
          </div>
        </div>
        <p id="note">Tu n'as pas de compte ? <span id="createAccount"><Link to="/inscription">Créer un compte</Link></span></p>
      </div>
    </div>
  );
}

export default Login;
