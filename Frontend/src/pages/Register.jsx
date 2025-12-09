import { useState } from "react";
import "../styles/pages/register.css";
import logo from "../assets/logos/logo.png";
import google from "../assets/logos/google.png";
import facebook from "../assets/logos/facebook.png";

const API = import.meta.env.VITE_API_URL || "";

function Register() {
  const [showPsswd, setShowPsswd] = useState(false);

  return (
    <body className="body">
      <div className="register-container">
      {/* HEADER */}
      <div className="register-header">
        <img className="register-logo" src={logo} alt="logo" />
        <h2 className="register-title">Inscription</h2>
      </div>

      {/* FORM */}
      <form className="register-form">

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
        <button type="submit" className="register-button">
          S'inscrire
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
        <p id="note">Tu a deja un compte ? <span id="createAccount"><a href="/connexion">Se connecter</a></span></p>
    </div>
    </body>
  );
}

export default Register;
