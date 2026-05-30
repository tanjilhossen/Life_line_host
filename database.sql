CREATE DATABASE IF NOT EXISTS lifeline_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE lifeline_db;

CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NULL,
    location VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NULL,
    address VARCHAR(255) NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    contact_person VARCHAR(150) NULL,
    license_number VARCHAR(120) NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    icu_available INT NOT NULL DEFAULT 0,
    emergency_bed_available INT NOT NULL DEFAULT 0,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NULL,
    blood_group ENUM('A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-') NOT NULL,
    location VARCHAR(100) NOT NULL,
    address VARCHAR(255) NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    phone VARCHAR(30) NOT NULL,
    profession VARCHAR(120) NULL,
    donation_count INT NOT NULL DEFAULT 0,
    last_donation_date DATE NULL,
    age INT NULL,
    health_notes TEXT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fcm_token VARCHAR(255) NULL,
    status ENUM('Available', 'Busy', 'Suspended') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('donor', 'hospital') NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    location VARCHAR(150) NOT NULL,
    address VARCHAR(255) NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    blood_group ENUM('A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-') NULL,
    profession VARCHAR(120) NULL,
    donation_count INT NULL,
    last_donation_date DATE NULL,
    age INT NULL,
    health_notes TEXT NULL,
    contact_person VARCHAR(150) NULL,
    license_number VARCHAR(120) NULL,
    icu_available INT NOT NULL DEFAULT 0,
    emergency_bed_available INT NOT NULL DEFAULT 0,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    review_message TEXT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_pending_email_type (type, email, status)
);

CREATE TABLE IF NOT EXISTS blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group ENUM('A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-') NOT NULL,
    location VARCHAR(150) NOT NULL,
    district VARCHAR(100) NULL,
    upazila VARCHAR(100) NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    hospital_name VARCHAR(255) NOT NULL,
    needed_time VARCHAR(150) NOT NULL,
    patient_disease VARCHAR(255) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    tracking_token VARCHAR(80) NULL UNIQUE,
    expires_at DATETIME NULL,
    status ENUM('Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donor_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    donor_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected') NOT NULL DEFAULT 'Pending',
    notify_order INT NULL,
    distance_km DECIMAL(8, 2) NULL,
    notified_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
);
