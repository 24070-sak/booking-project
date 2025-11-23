import { useState,useEffect } from "react";
import '../styles/pages/login.css'
import logo from '../assets/logos/logo.png'
import google from '../assets/logos/google.png'
import facebook from '../assets/logos/facebook.png'

const API = import.meta.env.VITE_API_URL || "";

function Login() {
    const [showPsswd,setShowPsswd] = useState(false)
  return (
    <div className="container">

      <div className="login-header">
        <img className="logo" src={logo} alt="logo" />
        <h2 className="login-subtitle">Connexion</h2>
      </div>

      <form className="login-form">

        <div>
            <label className="form-label" htmlFor="email">
            Email
            </label>
           <div className="input-container">
            <i class="fa-solid fa-envelope"></i>
             <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Email"
                name="email"
            />
           </div>
        </div>

        <div>
            <label className="form-label" htmlFor="password">
            Mot de passe
            <span className="forgot-password">
                <a href="#"><span>Mot de passe oublié ?</span></a>
            </span>
            </label>
            <div className="input-container">
                <i class="fa-solid fa-lock"></i>
                <input
                id="password"
                type={showPsswd ? "text" : "password"}
                className="form-input"
                placeholder="Mot de passe"
                name="password"
                />
                <i className={`fa-solid ${showPsswd ? "fa-eye-slash" : "fa-eye"}`}
                   id="togglePassword"
                   onClick={() => setShowPsswd(!showPsswd)}
                   style={{cursor: "pointer" }}
                ></i>
            </div>

        </div>

        <button type="submit" className="login-button" name="login">
          Se connecter
        </button>
      </form>

      <div className="separator">ou</div>

      <div className="social-login">
        <div className="login-google">
          <img src={google} alt="google icon should be here" />
          <p>Se connecter avec google</p>
        </div>

        <div className="login-facebook">
          <img src={facebook} alt="facebook icon should be here" />
          <p>Se connecter avec facebook</p>
        </div>
      </div>
      
    </div>
  );
}

export default Login;
