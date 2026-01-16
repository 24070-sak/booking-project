import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/pages/register.css";
import logo from "../assets/logos/logo.png";
import google from "../assets/logos/google.png";
import facebook from "../assets/logos/facebook.png";

function Register() {
  const [showPsswd, setShowPsswd] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
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

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      // Séparer prénom et nom (très basique)
      const names = formData.fullName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || 'User';

      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName
      };

      const data = await register(userData);

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
      <div className="register-container">
        {/* HEADER */}
        <div className="register-header">
          <img className="register-logo" src={logo} alt="logo" />
          <h2 className="register-title">Inscription</h2>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

        {/* FORM */}
        <form className="register-form" onSubmit={handleSubmit}>

          {/* NOM COMPLET */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Nom complet
            </label>
            <div className="input-container">
              <i className="fa-solid fa-user"></i>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Nom complet"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group">
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

          {/* MOT DE PASSE */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mot de passe
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
              <i
                className={`fa-solid ${showPsswd ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPsswd(!showPsswd)}
                style={{ cursor: "pointer" }}
                id="toggle"
              ></i>
            </div>
          </div>

          {/* CONFIRMATION MOT DE PASSE */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirmer Mot de passe
            </label>
            <div className="input-container">
              <i className="fa-solid fa-lock"></i>
              <input
                id="confirmPassword"
                type={showPsswd ? "text" : "password"}
                className="form-input"
                placeholder="Confirmer mot de passe"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <i
                className={`fa-solid ${showPsswd ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPsswd(!showPsswd)}
                style={{ cursor: "pointer" }}
                id="toggle"
              ></i>
            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <div className="line">
          <hr />
          <span>ou</span>
          <hr />
        </div>

        {/* SOCIAL LOGIN */}
        <div className="social-login">
          <div className="login-google">
            <img src={google} alt="google icon" />
            <p>S'inscrire avec Google</p>
          </div>

          <div className="login-facebook">
            <img src={facebook} alt="facebook icon" />
            <p>S'inscrire avec Facebook</p>
          </div>
        </div>
        <p id="note">Tu as déjà un compte ? <span id="createAccount"><Link to="/connexion">Se connecter</Link></span></p>
      </div>
    </div>
  );
}

export default Register;
