-- CampusFind database schema
-- MySQL 8.0+
-- Run this file in MySQL Workbench or MySQL Command Line Client.

CREATE DATABASE IF NOT EXISTS campusfind
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusfind;

-- Sample user required by the Java code (reported_by = 1).
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (user_id, name, email, password)
VALUES (1, 'CampusFind Test User', 'test@campusfind.local', 'change-this-password')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Lost and found items.
CREATE TABLE IF NOT EXISTS items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(80),
    item_type ENUM('LOST', 'FOUND') NOT NULL,
    location VARCHAR(150) NOT NULL,
    item_date DATE NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    status ENUM('OPEN', 'CLAIMED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    reported_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_reported_by
        FOREIGN KEY (reported_by) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_items_type_status ON items (item_type, status);
CREATE INDEX idx_items_created_at ON items (created_at);
