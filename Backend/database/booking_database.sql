-- ============================================================
-- BASE DE DONNÉES BOOKING - À coller dans phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS booking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_system;

-- Table utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('client', 'admin', 'manager') DEFAULT 'client',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table types de chambres
CREATE TABLE room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    max_occupancy INT DEFAULT 2
);

-- Table équipements
CREATE TABLE amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50),
    description VARCHAR(200)
);

-- Table chambres
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    room_type_id INT NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    floor INT,
    size_sqm DECIMAL(6, 2),
    bed_type ENUM('single', 'double', 'king', 'twin') DEFAULT 'double',
    max_guests INT DEFAULT 2,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
);

-- Table équipements des chambres
CREATE TABLE room_amenities (
    room_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Table images des chambres
CREATE TABLE room_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(200),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Table réservations
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_guests INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Table paiements
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer') DEFAULT 'credit_card',
    transaction_id VARCHAR(100) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Table avis
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ============================================================
-- DONNÉES D'EXEMPLE
-- ============================================================

-- Utilisateurs
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
('admin@hotel.com', 'hash_admin', 'Admin', 'System', '+33123456789', 'admin'),
('manager@hotel.com', 'hash_manager', 'Marie', 'Dupont', '+33198765432', 'manager'),
('jean.martin@email.com', 'hash_client', 'Jean', 'Martin', '+33612345678', 'client'),
('sophie.bernard@email.com', 'hash_client', 'Sophie', 'Bernard', '+33687654321', 'client'),
('pierre.durand@email.com', 'hash_client', 'Pierre', 'Durand', '+33611223344', 'client');

-- Types de chambres
INSERT INTO room_types (name, description, base_price, max_occupancy) VALUES
('Standard', 'Chambre confortable', 89.00, 2),
('Superieure', 'Chambre spacieuse avec vue', 129.00, 2),
('Deluxe', 'Chambre luxueuse avec salon', 199.00, 3),
('Suite', 'Suite avec terrasse et jacuzzi', 349.00, 4),
('Familiale', 'Grande chambre pour familles', 159.00, 5);

-- Équipements
INSERT INTO amenities (name, icon, description) VALUES
('WiFi Gratuit', 'fa-wifi', 'Connexion WiFi haut debit'),
('Climatisation', 'fa-snowflake', 'Climatisation reversible'),
('TV Ecran Plat', 'fa-tv', 'TV 55 pouces avec Netflix'),
('Mini-bar', 'fa-glass-martini', 'Mini-bar garni'),
('Coffre-fort', 'fa-lock', 'Coffre-fort electronique'),
('Seche-cheveux', 'fa-wind', 'Seche-cheveux professionnel'),
('Room Service 24h', 'fa-concierge-bell', 'Service en chambre 24/7'),
('Vue Mer', 'fa-water', 'Vue panoramique sur la mer'),
('Balcon', 'fa-door-open', 'Balcon prive'),
('Baignoire', 'fa-bath', 'Baignoire balneo'),
('Machine a cafe', 'fa-coffee', 'Machine Nespresso'),
('Peignoirs', 'fa-tshirt', 'Peignoirs et chaussons');

-- Chambres
INSERT INTO rooms (room_number, name, description, room_type_id, price_per_night, floor, size_sqm, bed_type, max_guests, image_url) VALUES
('101', 'Chambre Standard Confort', 'Chambre agreable avec lit double', 1, 89.00, 1, 22.00, 'double', 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'),
('102', 'Chambre Standard Twin', 'Chambre avec deux lits simples', 1, 89.00, 1, 24.00, 'twin', 2, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'),
('201', 'Chambre Superieure Vue Jardin', 'Chambre spacieuse avec vue jardin', 2, 129.00, 2, 30.00, 'king', 2, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'),
('202', 'Chambre Superieure Vue Mer', 'Chambre avec vue mer et balcon', 2, 149.00, 2, 32.00, 'king', 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'),
('301', 'Chambre Deluxe Prestige', 'Chambre de luxe avec salon', 3, 199.00, 3, 45.00, 'king', 3, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'),
('302', 'Chambre Deluxe Panoramique', 'Vue panoramique a 180 degres', 3, 219.00, 3, 50.00, 'king', 3, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'),
('401', 'Suite Royale', 'Suite avec terrasse et jacuzzi', 4, 349.00, 4, 75.00, 'king', 4, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'),
('402', 'Suite Presidentielle', 'Notre plus belle suite', 4, 449.00, 4, 100.00, 'king', 4, 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800'),
('501', 'Chambre Familiale Cocon', 'Grande chambre pour familles', 5, 159.00, 5, 40.00, 'king', 5, 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800'),
('502', 'Chambre Familiale Communicante', 'Deux chambres communicantes', 5, 189.00, 5, 55.00, 'double', 6, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800');

-- Équipements des chambres
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(1,1),(1,2),(1,3),(1,5),(1,6),
(2,1),(2,2),(2,3),(2,5),(2,6),
(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,11),
(4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,11),
(5,1),(5,2),(5,3),(5,4),(5,5),(5,6),(5,7),(5,9),(5,11),
(6,1),(6,2),(6,3),(6,4),(6,5),(6,6),(6,7),(6,9),(6,11),
(7,1),(7,2),(7,3),(7,4),(7,5),(7,6),(7,7),(7,8),(7,9),(7,10),(7,11),(7,12),
(8,1),(8,2),(8,3),(8,4),(8,5),(8,6),(8,7),(8,8),(8,9),(8,10),(8,11),(8,12),
(9,1),(9,2),(9,3),(9,4),(9,5),(9,6),
(10,1),(10,2),(10,3),(10,4),(10,5),(10,6);

-- Réservations
INSERT INTO bookings (booking_reference, user_id, room_id, check_in_date, check_out_date, num_guests, total_price, status, special_requests) VALUES
('BK20260106A1B2C3', 3, 1, '2026-01-06', '2026-01-09', 2, 267.00, 'completed', 'Arrivee tardive vers 22h'),
('BK20260114D4E5F6', 4, 5, '2026-01-14', '2026-01-19', 2, 995.00, 'confirmed', 'Champagne anniversaire'),
('BK20260131G7H8I9', 5, 7, '2026-01-31', '2026-02-03', 3, 1047.00, 'confirmed', 'Vue mer souhaitee'),
('BK20260215J0K1L2', 3, 3, '2026-02-15', '2026-02-17', 2, 258.00, 'pending', NULL),
('BK20260121M3N4O5', 4, 9, '2026-01-21', '2026-01-24', 4, 477.00, 'cancelled', NULL);

-- Paiements
INSERT INTO payments (booking_id, amount, currency, payment_method, transaction_id, status, paid_at) VALUES
(1, 267.00, 'EUR', 'credit_card', 'TXN_001', 'completed', '2026-01-04 10:00:00'),
(2, 995.00, 'EUR', 'credit_card', 'TXN_002', 'completed', '2026-01-11 14:30:00'),
(3, 1047.00, 'EUR', 'paypal', 'TXN_003', 'completed', '2026-01-15 09:15:00'),
(4, 258.00, 'EUR', 'credit_card', 'TXN_004', 'pending', NULL),
(5, 477.00, 'EUR', 'credit_card', 'TXN_005', 'refunded', '2026-01-13 16:00:00');

-- Avis
INSERT INTO reviews (user_id, room_id, rating, comment, is_verified) VALUES
(3, 1, 4, 'Tres bonne chambre, propre et confortable.', TRUE),
(4, 5, 5, 'Sejour exceptionnel ! Chambre magnifique.', TRUE),
(5, 3, 5, 'Chambre spacieuse et tres bien equipee.', TRUE),
(3, 7, 5, 'La suite royale merite son nom !', TRUE),
(4, 9, 4, 'Parfait pour les familles !', TRUE);
