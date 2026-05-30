const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Replace whatsappClient usage
code = code.replace(/if \(donorPhone && whatsappClient && whatsappClient\.isReady\) \{[\s\S]*?\}\s*\}/, '// WhatsApp removed');

// Add /api/donor/dashboard and /api/donor/request-delete
if (!code.includes('/api/donor/dashboard')) {
    const additionalEndpoints = `
// --- ডোনার ড্যাশবোর্ড স্ট্যাটস ---
app.post('/api/donor/dashboard', (req, res) => {
    const donorId = Number(req.body.donorId);
    if (!Number.isInteger(donorId)) return res.status(400).json({ success: false, message: 'ডোনার আইডি সঠিক নয়।' });

    const query = \`
        SELECT 
            (SELECT COUNT(*) FROM donor_requests WHERE donor_id = ?) AS total_requests,
            (SELECT COUNT(*) FROM donor_requests WHERE donor_id = ? AND status = 'Accepted') AS total_approved,
            d.donation_count,
            d.last_donation_date,
            (
                SELECT br.id FROM donor_requests dr 
                JOIN blood_requests br ON dr.request_id = br.id 
                WHERE dr.donor_id = ? AND dr.status = 'Pending' 
                ORDER BY br.created_at DESC LIMIT 1
            ) AS active_request_id
        FROM donors d WHERE d.id = ?
    \`;
    db.query(query, [donorId, donorId, donorId, donorId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'স্ট্যাটস লোড করতে সমস্যা হয়েছে।' });
        if(results.length > 0) {
            res.json({ success: true, data: results[0] });
        } else {
            res.json({ success: false, message: 'ডোনার পাওয়া যায়নি।' });
        }
    });
});

// --- ডোনার রিকোয়েস্ট ডিলিট করা ---
app.post('/api/donor/request-delete', (req, res) => {
    const { donorId, requestId } = req.body;
    if (!Number.isInteger(donorId) || !Number.isInteger(requestId)) {
        return res.status(400).json({ success: false, message: 'ডেটা সঠিক নয়।' });
    }
    const query = 'DELETE FROM donor_requests WHERE donor_id = ? AND request_id = ?';
    db.query(query, [donorId, requestId], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'ডিলিট করতে সমস্যা হয়েছে।' });
        res.json({ success: true, message: 'মেসেজ ডিলিট করা হয়েছে।' });
    });
});

app.post('/api/request/details', (req, res) => {
    const requestId = Number(req.body.requestId);
    db.query('SELECT * FROM blood_requests WHERE id = ?', [requestId], (err, results) => {
        if (err) return res.status(500).json({success:false});
        if(results.length > 0) res.json({success:true, data:results[0]});
        else res.json({success:false, message: 'Not found'});
    });
});
`;
    code = code.replace('// --- ডোনারের রিকোয়েস্ট রেসপন্স (Accept/Reject) ---', additionalEndpoints + '\n// --- ডোনারের রিকোয়েস্ট রেসপন্স (Accept/Reject) ---');
}

fs.writeFileSync('server.js', code);
console.log('Patched server.js');
