import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import "../styles/Components/HeaderDashBoard.css";
import logo from "../logo.svg";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
export default function HeaderDashBord({ onMenuClick }) {
  return (
    <header className="header-container">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <MenuRoundedIcon />
        </button>

        <div className="header-titles">
          <h1>Property List</h1>
          <p className="breadcrumbs">Properties &gt; Add Property</p>
        </div>
      </div>

      <div className="header-right">
        <div className="user-actions">
          <NotificationsNoneOutlinedIcon className="notif-icon" />
          <img src={logo} alt="profile" className="profile-img" />
        </div>
        <button className="add-btn">
          <AddRoundedIcon />
          <span>Add Property</span>
        </button>
      </div>
    </header>
  );
}
