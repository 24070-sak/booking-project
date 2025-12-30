import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL || "";
import logo from '../assets/logos/logo.png'
import '../styles/pages/home.css'
import Header from "../components/Header";
import image1 from '../assets/imgs/hot1.avif'
import image2 from '../assets/imgs/hot2.avif'
import image3 from '../assets/imgs/hot3.avif'
import image4 from '../assets/imgs/hot4.avif'
import image5 from '../assets/imgs/hot5.webp'
import SearchBar from "../components/SearchBar";
import HotelCard from "../components/HotelCard";

function Home() {
    const hotels = [
        {
            id: 1,
            title: "Hotel Azalai",
            location: "Nouakchott",
            price: "120€/nuit",
            imageUrl: image1,
            rating: 4.5,
            dateAvailable: "Disponible dès le 20 Août"
        },
        {
            id: 2,
            title: "Hotel Monotel",
            location: "Nouakchott",
            price: "95€/nuit",
            imageUrl: image2,
            rating: 4.2,
            dateAvailable: "Disponible dès le 15 Août"
        },
        {
            id: 3,
            title: "Hotel Tfeila",
            location: "Nouadhibou",
            price: "85€/nuit",
            imageUrl: image3,
            rating: 4.0,
            dateAvailable: "Disponible dès le 18 Août"
        },
        {
            id: 4,
            title: "Hotel Sahara",
            location: "Atar",
            price: "75€/nuit",
            imageUrl: image4,
            rating: 4.3,
            dateAvailable: "Disponible dès le 22 Août"
        }
    ];

    return (
        <div className="home-body">
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
                    <div className="hotels-grid">
                        {hotels.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                title={hotel.title}
                                location={hotel.location}
                                price={hotel.price}
                                imageUrl={hotel.imageUrl}
                                rating={hotel.rating}
                                dateAvailable={hotel.dateAvailable}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Home;