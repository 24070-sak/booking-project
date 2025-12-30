const API = import.meta.env.VITE_API_URL || "";
import { useState,useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/pages/home.css'
import Header from "../components/Header";
import image from '../assets/imgs/hot1.avif'
import SearchBar from "../components/SearchBar";
import HotelCard from "../components/HotelCard";

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
            <div className="search-border">
                <SearchBar />
            </div>
            <div className="card-container">
                <div className="paragraphe">
                    <h2>Offres des hotels en ce moment</h2>
                    <p>Voir plus d'offres <i className="fa-solid fa-arrow-right"></i></p>
                </div>
                <HotelCard title="Hotel Azalai" location="Nouakchott" price="$120/night" imageUrl={image} rating={4.5} dateAvailable="Available from 20th Aug"></HotelCard>
            </div>
        </div>
        </body>
    )
}
export default Home;