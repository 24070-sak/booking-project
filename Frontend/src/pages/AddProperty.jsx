import React, { useState } from 'react';
import '../styles/pages/addProperty.css';
import logo from '../assets/logos/logo.png';

const AddProperty = () => {
    const [price, setPrice] = useState('');

    return (
        <div className="add-property-container">
            <nav>
                <div className="logo">
                    <img src={logo} alt="Hotely" />
                </div>
                <ul>
                    <li>
                        <a href="#">Dashboard</a>
                        <div className="icon"></div>
                    </li>
                    <li className="current">
                        <a href="#">Properties</a>
                        <div className="icon"></div>
                    </li>
                    <li>
                        <a href="#">Reservations</a>
                        <div className="icon"></div>
                    </li>
                    <li>
                        <a href="#">Calendar</a>
                        <div className="icon"><i className="fa-regular fa-calendar"></i></div>
                    </li>
                    <li>
                        <a href="#">Reviews</a>
                        <div className="icon"><i className="fa-regular fa-star"></i></div>
                    </li>
                    <li>
                        <a href="#">Messages</a>
                        <div className="icon"><i className="fa-regular fa-message"></i></div>
                    </li>
                    <li>
                        <a href="#">Payments</a>
                        <div className="icon"><i className="fa-solid fa-wallet"></i></div>
                    </li>
                    <li>
                        <a href="#">Settings</a>
                        <div className="icon"></div>
                    </li>
                    <li>
                        <a href="#">Log out</a>
                        <div className="icon"><i className="fa-solid fa-power-off"></i></div>
                    </li>
                </ul>
            </nav>
            <main>
                <div className="header">
                    <h1>Add New Property</h1>
                    <div className="icons">
                        <i className="fa-solid fa-bell"></i>
                        <button> + New Property</button>
                    </div>
                </div>
                <div className="details">
                    <h2>Property Details</h2>
                    <div className="div">
                        <div className="name">
                            <label htmlFor="Name">Property Name</label>
                            <input type="tel" name="" defaultValue="Property name" id="Name" />
                        </div>
                        <div className="location">
                            <label htmlFor="">Location</label>
                            <select name="" id="">
                                <option value="">Nouakchott</option>
                                <option value=""></option>
                            </select>
                            <select name="" id="">
                                <option value="">Tevregh Zeyna</option>
                                <option value=""></option>
                            </select>
                        </div>
                    </div>
                    <div className="status">
                        <label htmlFor="status">Status</label>
                        <select name="" id="status">
                            <option value="">Published</option>
                            <option value="">----</option>
                        </select>
                    </div>
                    <div className="discrp">
                        <label htmlFor="">Description</label>
                        <input type="text" placeholder="Enter Property description here ... " name="" id="" />
                    </div>
                    <div className="price">
                        <label htmlFor="">Price per day (MRU) <small style={{ backgroundColor: 'rgb(181, 178, 178)' }} id="small">{price}</small></label>
                        <input
                            type="number"
                            name=""
                            id=""
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <input type="file" name="" id="" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddProperty;
