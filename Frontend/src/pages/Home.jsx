import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL || "";
import { getAllHotels } from "../services/hotelService";
import logo from '../assets/logos/logo.png'
import '../styles/pages/home.css'
import Header from "../components/Header";
import HotelCard from "../components/HotelCard";
import bed from '../assets/imgs/bed.png'
import shield from '../assets/imgs/shield.png'
import search from '../assets/imgs/search.png'
import Footer from "../components/Footer";

function Home() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchHotels() {
            try {
                // On récupère tous les hôtels
                const data = await getAllHotels();
                if (data.hotels) {
                    setHotels(data.hotels);
                }
            } catch (err) {
                console.error("Erreur chargement hotels:", err);
                setError("Impossible de charger les hôtels.");
            } finally {
                setLoading(false);
            }
        }

        fetchHotels();
    }, []);

    return (
        <div className="home-body">
            <div className="home-container">
                <Header />
                <div className="card-container">
                    <div className="paragraphe">
                        <h2>Offres des hotels en ce moment</h2>
                        <p>Voir plus d'offres <i className="fa-solid fa-arrow-right"></i></p>
                    </div>

                    {loading && <p style={{ textAlign: 'center' }}>Chargement des offres...</p>}
                    {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                    <div className="hotels-grid">
                        {hotels.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                id={hotel.id}
                                title={hotel.name}
                                location={hotel.location}
                                price={`Dès 80€/nuit`} // Prix indicatif
                                imageUrl={hotel.image_url}
                                rating={hotel.rating}
                                dateAvailable={"Disponible"}
                            />
                        ))}
                    </div>
                </div>
                <div className="our-logos">
                    <div className="logo-item">
                        <img src={bed} alt="Bed Icon" />
                        <span>Economisez gros</span>
                        <p>Economisez gros sur vos reservations Proftez des meilleures offres des maintenant! </p>
                    </div>
                    <div className="logo-item">
                        <img src={shield} alt="Shield Icon" />
                        <span>Fiable service</span>
                        <p>Profitez d’un service fiable à chaque réservation Votre confiance est notre priorité </p>
                    </div>
                    <div className="logo-item">
                        <img src={search} alt="Search Icon" />
                        <span>Simple Recherche</span>
                        <p>Recherche simple et intuitive pour trouver votre hotel parfait</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default Home;