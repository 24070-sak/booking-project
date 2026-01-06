import React from "react";
import logo from "../logo.svg";
import "../styles/Components/ShortDetaisHotel.css";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

export default function ShortDetaisHotel({
  name = "Seaside Hotel",
  location = "Los Angeles, CA",
  status = "Published",
  price = "250",
  type = "preview",
}) {
  const statusClass = status.toLowerCase();

  return (
    <div className="property-row">
      <div className="property-main">
        <div className="property-image">
          <img src={logo} alt={name} />
        </div>
        <div className="property-info">
          <h4 className="property-name">{name}</h4>
          <p className="property-location">{location}</p>
        </div>
      </div>

      <div className="property-status-container">
        <span className={`status-badge ${statusClass}`}>{status}</span>
      </div>

      <div className="property-price">
        <p>${price}</p>
      </div>

      <div className="property-actions">
        <button className="action-btn">
          <EditNoteOutlinedIcon className="icon" />
          <span>Edit</span>
        </button>
        <button className="action-btn">
          <VisibilityOutlinedIcon className="icon" /> <span>Preview</span>
        </button>
      </div>
    </div>
  );
}
