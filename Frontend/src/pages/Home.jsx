const API = import.meta.env.VITE_API_URL || "";
import { useState,useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/pages/home.css'
import Header from "../components/Header";



function Home(){
    return(
        <body className="home-body">
            <div className="home-container">
            <Header />
            <div className="messages">
            <p className="home-title">
                    Explorez les hotels de Mauritanie
            </p>
            <p className="home-sub-title">
                Nous comparons les prix des plusieurs hotels
            </p>
            </div>
        </div>
        </body>
    )
}
export default Home;