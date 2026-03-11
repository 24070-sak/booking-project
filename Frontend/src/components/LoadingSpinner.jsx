import React from 'react';
import '../styles/components/loadingSpinner.css';

const LoadingSpinner = ({ text = "Chargement...", fullScreen = false }) => {
    return (
        <div className={`loading-spinner-container ${fullScreen ? 'full-screen' : ''}`}>
            <div className="spinner"></div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
