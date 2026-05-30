const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Remove WhatsApp logic
const whatsappRegex = /\/\/ ==========================================\s*\r?\n\/\/    2\. WhatsApp Automation Logic\s*\r?\n\/\/ ==========================================\s*\r?\nlet whatsappClient = null;[\s\S]*?\/\/ For nodemon restarts\s*\r?\nprocess\.once\('SIGUSR2', async \(\) => \{\s*\r?\n    await shutdownWhatsApp\(\);\s*\r?\n    process\.kill\(process\.pid, 'SIGUSR2'\);\s*\r?\n\}\);/g;

serverCode = serverCode.replace(whatsappRegex, `// ==========================================
//    2. Push Notification Logic Init
// ==========================================
// Firebase Admin SDK initialized at the top.
// WhatsApp logic has been removed as requested.`);

// Update donor login
const loginRegex = /\/\/ --- ডোনার লগিন ---[\s\S]*?app\.post\('\/api\/donor\/login', \(req, res\) => \{[\s\S]*?db\.query\(query, \[username, password\], \(err, results\) => \{[\s\S]*?res\.json\(\{ success: false, message: 'ভুল ইউজারনেম\/পাসওয়ার্ড\।' \}\);\s*\r?\n    \}\);\s*\r?\n\}\);/g;

serverCode = serverCode.replace(loginRegex, `// --- ডোনার লগিন ---
app.post('/api/donor/login', (req, res) => {
    const username = normalizeText(req.body.username);
    const password = normalizeText(req.body.password);
    const fcmToken = req.body.fcmToken ? normalizeText(req.body.fcmToken) : null;
    
    const query = "SELECT id, name, email, phone, blood_group, location, address, latitude, longitude, profession, donation_count, last_donation_date, age, health_notes, status FROM donors WHERE username = ? AND password = ? AND status != 'Suspended'";
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
        if (results.length > 0) {
            const donorData = results[0];
            if (fcmToken) {
                db.query("UPDATE donors SET fcm_token = ? WHERE id = ?", [fcmToken, donorData.id], (updateErr) => {
                    if (updateErr) console.error("Failed to update FCM token for donor", donorData.id);
                });
            }
            res.json({ success: true, message: 'লগিন সফল!', donorData });
        } else {
            res.json({ success: false, message: 'ভুল ইউজারনেম/পাসওয়ার্ড।' });
        }
    });
});`);

fs.writeFileSync('server.js', serverCode);
console.log('Updated server.js');
