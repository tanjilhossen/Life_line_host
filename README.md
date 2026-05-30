# 🩸 LifeLine - Blood, Hospital & Doctor Booking System

**LifeLine** is a comprehensive, multi-module web and mobile application designed to connect blood donors, hospitals, doctors, and people in need of emergency medical services in Bangladesh. It features real-time donor location mapping, smart nearest-donor request queuing, hospital resource (ICU/emergency bed) tracking, automated notifications, and doctor appointment booking.

---

## 📋 Table of Contents
1. [Features (বৈশিষ্ট্যসমূহ)](#-features-বৈশিষ্ট্যসমূহ)
2. [Project Architecture (প্রজেক্ট আর্কিটেকচার)](#-project-architecture-প্রজেক্ট-আর্কিটেকচার)
3. [Prerequisites (প্রয়োজনীয় সফটওয়্যার)](#-prerequisites-প্রয়োজনীয়-সফটওয়্যার)
4. [Step-by-Step Setup Guide (ধাপে ধাপে সেটআপ গাইড)](#-step-by-step-setup-guide-ধাপে-ধাপে-সেটআপ-গাইড)
   - [1. Clone the Project (প্রজেক্ট ডাউনলোড)](#1-clone-the-project-প্রজেক্ট-ডাউনলোড)
   - [2. Database Setup (ডাটাবেস সেটআপ)](#2-database-setup-ডাটাবেস-সেটআপ)
   - [3. Backend Setup (ব্যাকএন্ড সেটআপ)](#3-backend-setup-ব্যাকএন্ড-সেটআপ)
   - [4. Mobile App Setup (মোবাইল অ্যাপ সেটআপ)](#4-mobile-app-setup-মোবাইল-অ্যাপ-সেটআপ)
5. [Demo Credentials (টেস্ট অ্যাকাউন্টসমূহ)](#-demo-credentials-টেস্ট-অ্যাকাউন্টসমূহ)
6. [WhatsApp & Firebase Configuration (অন্যান্য কনফিগারেশন)](#-whatsapp--firebase-configuration-অন্যান্য-কনফিগারেশন)

---

## ✨ Features (বৈশিষ্ট্যসমূহ)

*   **🩸 Emergency Blood Request Queue:** Smart serial matching system that scans all available donors in the same district, sorts them by distance (nearest first), and sends notifications sequentially.
*   **🏥 Hospital Resource Dashboard:** Hospitals can manage ICU and emergency bed availability in real-time.
*   **🩺 Doctor Booking System:** Find doctors based on specialty, district, and fee, and book appointments with dummy payment processing.
*   **👑 Master Admin Panel:** Admin reviews, approves, or rejects hospital and donor registration applications before they can log in.
*   **📱 Expo Mobile App (donor-app):** Mobile app for donors to manage their profile, donation records, toggle availability status, and receive push notifications for emergency blood needs.

---

## 🏗️ Project Architecture (প্রজেক্ট আর্কিটেকচার)

The project is split into two main parts:
1.  **Backend & Web Portal (Root directory):** Node.js/Express web server serving HTML/CSS/JS files for the Admin, Hospital, and Doctor panels, and API endpoints.
2.  **Mobile Client (`LifeLine-app/donor-app`):** React Native / Expo application for blood donors.

---

## 🛠️ Prerequisites (প্রয়োজনীয় সফটওয়্যার)

Before setting up, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MySQL Database Server](https://www.mysql.com/) (XAMPP / WampServer / MySQL Installer)
*   [Git](https://git-scm.com/)

---

## 🚀 Step-by-Step Setup Guide (ধাপে ধাপে সেটআপ গাইড)

### 1. Clone the Project (প্রজেক্ট ডাউনলোড)
Clone the repository or download the ZIP file and extract it:
```bash
git clone https://github.com/your-username/lifeline.git
cd lifeline
```

---

### 2. Database Setup (ডাটাবেস সেটআপ)
Make sure your MySQL server is running (e.g., start Apache and MySQL in XAMPP control panel).

1. Log into your MySQL command line or open **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Create a new database named `lifeline_db`:
   ```sql
   CREATE DATABASE lifeline_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import the `database.sql` file located in the root directory into the newly created database:
   * **Via Terminal:**
     ```bash
     mysql -u your_username -p lifeline_db < database.sql
     ```
   * **Via phpMyAdmin:** Select `lifeline_db` -> Click **Import** -> Choose `database.sql` -> Click **Go/Import**.

---

### 3. Backend Setup (ব্যাকএন্ড সেটআপ)

1. Open your terminal in the **root directory** of the project and install all dependencies:
   ```bash
   npm install
   ```
2. Copy the `.env.example` file and rename it to `.env`:
   * **Windows (Command Prompt / PowerShell):**
     ```bash
     copy .env.example .env
     ```
   * **macOS / Linux:**
     ```bash
     cp .env.example .env
     ```
3. Open the `.env` file and replace the credentials with your own MySQL details:
   ```env
   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD="your_mysql_password_here"
   DB_NAME=lifeline_db
   SUPER_ADMIN_KEY="TanjilBoss@2026"
   ENABLE_WHATSAPP=false
   ```
4. **Seed Test Doctor Data (অপশনাল - ডক্টর ডাটা সিড করুন):**
   Run the seed script to populate the doctor and chamber database tables with dummy entries:
   ```bash
   node seed-doctors.js
   ```
5. **Start the server (সার্ভার রান করুন):**
   ```bash
   npm start
   ```
   The backend server will run at `http://localhost:3000`.

---

### 4. Mobile App Setup (মোবাইল অ্যাপ সেটআপ)

1. Open a new terminal window and navigate to the mobile application directory:
   ```bash
   cd LifeLine-app/donor-app
   ```
2. Install the mobile application dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. **Run on Mobile:** Download the **Expo Go** app on your Android/iOS phone, and scan the QR code displayed in the terminal to load the app.

---

## 🔑 Demo Credentials (টেস্ট অ্যাকাউন্টসমূহ)

Use the following credentials to test various features of the application without manual registrations:

### 1. Doctor Logins (ডক্টর লগইন)
You can log in as a doctor at `http://localhost:3000/doctor-dashboard.html` using the usernames below (all have the password `password123`):
*   **Cardiologist (Dhaka):** `dr.fazlul` / `password123`
*   **Gynaecologist (Dhaka):** `dr.shahina` / `password123`
*   **Neurologist (Dhaka):** `dr.tareq` / `password123`
*   *(For a full list of doctor accounts, refer to [doctor_login_credentials.txt](file:///e:/LifeLine%20project/doctor_login_credentials.txt))*

### 2. Dummy Payment for Appointments (পেমেন্ট টেস্ট গেটওয়ে)
When booking a doctor, use these credentials to simulate a successful payment:
*   **bKash:** Number: `01700000000` | OTP: `123456` | PIN: `12345`
*   **Nagad:** Number: `01900000000` | OTP: `123456` | PIN: `1234`
*   **Visa Card:** Card: `4000 1234 5678 9010` | Expiry: `12/30` | CVV: `123`
*   *(For complete card/net-banking details, see [dummy_payment_credentials.txt](file:///e:/LifeLine%20project/dummy_payment_credentials.txt))*

### 3. Master Admin Login (মাস্টার এডমিন)
Manage hospital and donor registrations waiting for approval:
*   **URL:** `http://localhost:3000/master-dashboard.html`
*   **Verification Key (Master Key):** `TanjilBoss@2026` (Must match the `SUPER_ADMIN_KEY` in your `.env` file)

---

## ⚙️ WhatsApp & Firebase Configuration (অন্যান্য কনফিগারেশন)

### 📲 Firebase (Push Notifications)
The mobile application uses Firebase Cloud Messaging (FCM) to deliver push notifications. 
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Add an Android/iOS app to your Firebase project.
3. Download `google-services.json` and place it in the mobile app directory (`LifeLine-app/donor-app/google-services.json`).
4. Generate a Firebase Admin Service Account key (JSON file) from Project Settings -> Service accounts and place it in the root directory as `serviceAccountKey.json`.

### 💬 WhatsApp Integration (whatsapp-web.js)
If you enable WhatsApp alerts by setting `ENABLE_WHATSAPP=true` in `.env`:
*   The server will print a QR code in the console upon starting.
*   Scan the QR code with your WhatsApp app (linked devices option) to allow the server to send automated notification alerts on request accept.
