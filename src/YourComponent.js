import React, { useState } from 'react';
import './styles.css'; // Ensure this path is correct

const YourComponent = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const items = [
        { title: "Lost Wallet", description: "Black leather wallet with ID and cards.", image: "path/to/image1.jpg" },
        { title: "Found Keys", description: "Set of keys with a blue keychain.", image: "path/to/image2.jpg" },
        { title: "Lost Phone", description: "iPhone 12, black color.", image: "path/to/image3.jpg" },
    ];

    const openModal = (item) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div>
            <div className="hero">
                <h1 className="hero-title">Welcome to Lost and Found</h1>
                <p className="hero-subtitle">Find your lost items or report found items easily!</p>
                <button className="button hero-button">Get Started</button>
            </div>
            <div className="navbar">
                <div className="navbar-container">
                    <div className="navbar-logo">Lost & Found</div>
                    <div className="navbar-links">
                        <input type="text" placeholder="Search items..." className="search-bar" />
                        <button className="button"><FaSearch /></button>
                    </div>
                </div>
            </div>
            <div className="card-container">
                {items.map((item, index) => (
                    <div className="card" key={index} onClick={() => openModal(item)}>
                        <img src={item.image} alt={item.title} className="card-image" />
                        <h2 className="card-title">{item.title}</h2>
                        <p className="card-description">{item.description}</p>
                        <button className="button"><FaHeart /> Claim Item</button>
                    </div>
                ))}
            </div>
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>{selectedItem.title}</h2>
                        <img src={selectedItem.image} alt={selectedItem.title} className="modal-image" />
                        <p>{selectedItem.description}</p>
                    </div>
                </div>
            )}
            <div className="footer">© 2025 Lost and Found</div>
        </div>
    );
};

export default YourComponent;