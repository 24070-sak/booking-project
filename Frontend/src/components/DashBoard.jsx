import React, { useState } from "react";
import Sidebar from "./Sidebar";
import HeaderDashBord from "../Components/HeaderDashBoard";
import "../styles/DashBoard.css";
import ShortDetaisHotel from "../Components/ShortDetaisHotel";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  const [activeItem, setActiveItem] = useState("Properties");

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={isOpen}
        activeItem={activeItem}
        setActiveItem={(item) => {
          setActiveItem(item);
          setIsOpen(false);
        }}
      />

      <div className="main-content">
        <HeaderDashBord onMenuClick={() => setIsOpen(!isOpen)} />
        <ShortDetaisHotel />
      </div>

      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}
