const API = import.meta.env.VITE_API_URL || "";
import { useState,useEffect } from "react";
import logo from '../assets/logos/logo.png'
import '../styles/components/searchBar.css'
import Header from "../components/Header";



function SearchBar(){
    return(
        <div className="search-bar">
            <input type="text" placeholder="Hotel - Ou aller ?" className="search-input"/>
            <input type="text" placeholder="Arrive/Depart" className="search-input"/>
            <input type="text" placeholder="voyageurs et chambres" className="search-input"/>
            <button className="search-button"><i className="fa-solid fa-magnifying-glass"></i> Rechercher</button>
        </div>
    )
}
export default SearchBar;