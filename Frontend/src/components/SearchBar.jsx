const API = import.meta.env.VITE_API_URL || "";
import { useState,useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/pages/home.css'
import Header from "../components/Header";



function SearchBar(){
    return(
        <div className="search-bar">
            <input type="text" placeholder="Rechercher des hotels, destinations..." className="search-input"/>
            <input type="text" placeholder="Arrive/Depart"/>
            <input type="text" placeholder="voyageurs et chambres"/>
            <button className="search-button"><i className="fa-solid fa-magnifying-glass"></i></button>
        </div>
    )
}
export default SearchBar;