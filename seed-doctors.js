require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(async (err) => {
    if (err) throw err;
    console.log('DB connected');

    const testDoctors = [
        // Dhaka
        { name: 'Dr. A.K.M. Fazlul Hoque', district: 'Dhaka', specialties: 'Cardiology', designation: 'Professor', exp: 20, fee: 1000, username: 'dr.fazlul', password: 'password123', clinic: 'Labaid Cardiac Hospital', location: 'Dhanmondi, Dhaka', days: 'Saturday, Monday, Wednesday', start: '17:00:00', end: '21:00:00', time: 15 },
        { name: 'Dr. Shahina Begum', district: 'Dhaka', specialties: 'Gynaecology', designation: 'Associate Professor', exp: 15, fee: 800, username: 'dr.shahina', password: 'password123', clinic: 'Square Hospital', location: 'Panthapath, Dhaka', days: 'Sunday, Tuesday, Thursday', start: '16:00:00', end: '20:00:00', time: 20 },
        { name: 'Dr. MD. Tareq Rahman', district: 'Dhaka', specialties: 'Neurology', designation: 'Consultant', exp: 12, fee: 1200, username: 'dr.tareq', password: 'password123', clinic: 'Evercare Hospital', location: 'Bashundhara, Dhaka', days: 'Monday, Wednesday, Friday', start: '18:00:00', end: '22:00:00', time: 20 },
        
        // Chattogram
        { name: 'Dr. Saifur Rahman', district: 'Chattogram', specialties: 'Medicine', designation: 'Professor', exp: 25, fee: 800, username: 'dr.saifur', password: 'password123', clinic: 'Max Hospital', location: 'Mehedibag, Chattogram', days: 'Sat, Sun, Mon, Tue', start: '15:00:00', end: '21:00:00', time: 15 },
        { name: 'Dr. Nazma Chowdhury', district: 'Chattogram', specialties: 'Pediatrics', designation: 'Consultant', exp: 10, fee: 600, username: 'dr.nazma', password: 'password123', clinic: 'Epic Health Care', location: 'Panchlaish, Chattogram', days: 'Sun, Tue, Thu', start: '16:00:00', end: '19:00:00', time: 15 },
        
        // Sylhet
        { name: 'Dr. Iqbal Hussain', district: 'Sylhet', specialties: 'Orthopedics', designation: 'Associate Professor', exp: 18, fee: 700, username: 'dr.iqbal', password: 'password123', clinic: 'Mount Adora Hospital', location: 'Nayasarak, Sylhet', days: 'Sat, Mon, Wed', start: '17:00:00', end: '20:30:00', time: 15 },
        
        // Rajshahi
        { name: 'Dr. Farhana Yasmin', district: 'Rajshahi', specialties: 'Dermatology', designation: 'Consultant', exp: 8, fee: 500, username: 'dr.farhana', password: 'password123', clinic: 'Popular Diagnostic', location: 'Laxmipur, Rajshahi', days: 'Everyday except Friday', start: '16:00:00', end: '20:00:00', time: 10 },
        
        // Khulna
        { name: 'Dr. Asaduzzaman', district: 'Khulna', specialties: 'Medicine', designation: 'Professor', exp: 30, fee: 600, username: 'dr.asad', password: 'password123', clinic: 'Khulna City Medical', location: 'KDA Avenue, Khulna', days: 'Mon, Wed, Thu', start: '18:00:00', end: '22:00:00', time: 15 },
        
        // Barisal
        { name: 'Dr. Rafiqul Islam', district: 'Barisal', specialties: 'ENT', designation: 'Assistant Professor', exp: 12, fee: 600, username: 'dr.rafiqul', password: 'password123', clinic: 'Rahat Anwar Hospital', location: 'Band Road, Barisal', days: 'Sat, Tue, Thu', start: '15:00:00', end: '18:00:00', time: 15 },

        // Rangpur
        { name: 'Dr. Tanjila Akter', district: 'Rangpur', specialties: 'Gynaecology', designation: 'Consultant', exp: 9, fee: 500, username: 'dr.tanjila', password: 'password123', clinic: 'Update Diagnostic', location: 'Dhap, Rangpur', days: 'Sun, Mon, Wed, Thu', start: '10:00:00', end: '14:00:00', time: 20 },

        // Mymensingh
        { name: 'Dr. Kamrul Hasan', district: 'Mymensingh', specialties: 'Psychiatry', designation: 'Associate Professor', exp: 15, fee: 700, username: 'dr.kamrul', password: 'password123', clinic: 'Swadesh Hospital', location: 'Charpara, Mymensingh', days: 'Sat, Mon, Thu', start: '16:00:00', end: '20:00:00', time: 25 },
        
        // Comilla
        { name: 'Dr. Mahbubul Alam', district: 'Comilla', specialties: 'Cardiology', designation: 'Consultant', exp: 14, fee: 800, username: 'dr.mahbub', password: 'password123', clinic: 'Moon Hospital', location: 'Jhawtola, Comilla', days: 'Everyday except Friday', start: '17:00:00', end: '21:00:00', time: 15 }
    ];

    let credentialsText = "LifeLine Doctor Test Accounts\n\nLogin URL: http://localhost:3000/doctor-dashboard.html\n\n";

    const queryPromise = (q, v) => new Promise((resolve, reject) => db.query(q, v, (err, res) => err ? reject(err) : resolve(res)));

    for(let d of testDoctors) {
        try {
            const drRes = await queryPromise(
                "INSERT INTO doctors (name, email, phone, district, specialties, designation, experience_years, fee, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [d.name, d.username + '@test.com', '01700000000', d.district, d.specialties, d.designation, d.exp, d.fee, d.username, d.password]
            );
            
            await queryPromise(
                "INSERT INTO doctor_chambers (doctor_id, clinic_name, location, visiting_days, start_time, end_time, time_per_patient_min) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [drRes.insertId, d.clinic, d.location, d.days, d.start, d.end, d.time]
            );

            credentialsText += `Name: ${d.name}\nDistrict: ${d.district}\nSpecialty: ${d.specialties}\nUsername: ${d.username}\nPassword: ${d.password}\n\n`;
            console.log("Added " + d.name);
        } catch(e) {
            if(e.code === 'ER_DUP_ENTRY') {
                console.log("Already exists: " + d.name);
                credentialsText += `Name: ${d.name}\nDistrict: ${d.district}\nSpecialty: ${d.specialties}\nUsername: ${d.username}\nPassword: ${d.password}\n\n`;
            } else {
                console.error("Error for " + d.name + ": " + e.message);
            }
        }
    }

    fs.writeFileSync('doctor_login_credentials.txt', credentialsText);
    console.log("Credentials saved to doctor_login_credentials.txt");
    process.exit();
});
