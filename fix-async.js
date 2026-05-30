
const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Replace donor update-profile body (lines 1207-1219 equivalent)
// Pattern: from "    const query = `\n        UPDATE donors" to the closing "});"
const donorPattern = /    const query = `\n        UPDATE donors \n        SET phone = \?, age = \?, profession = \?, location = \?, address = \?, latitude = \?, longitude = \?\n        WHERE id = \?\n    `;\n    db\.query\(query, \[phone, age \|\| null, profession \|\| null, location, address \|\| null, latitude \|\| null, longitude \|\| null, Number\(donorId\)\], \(err\) => \{\n        if \(err\) return res\.status\(500\)\.json\(\{ success: false, message: '[\s\S]*?' \}\);\n        \n        db\.query\("SELECT id, name, email, phone, blood_group, location, address, latitude, longitude, profession, donation_count, last_donation_date, age, health_notes, status FROM donors WHERE id = \?", \[Number\(donorId\)\], \(err, results\) => \{\n            if \(err \|\| results\.length === 0\) return res\.json\(\{ success: true, message: '[\s\S]*?' \}\);\n            res\.json\(\{ success: true, message: '[\s\S]*?', donorData: results\[0\] \}\);\n        \}\);\n    \}\);\n\}\);/;

const donorReplacement = `    try {
        await dbQuery(
            \`UPDATE donors SET phone = ?, age = ?, profession = ?, location = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?\`,
            [phone, age || null, profession || null, location, address || null, latitude || null, longitude || null, Number(donorId)]
        );
        const results = await dbQuery(
            \`SELECT id, name, email, phone, blood_group, location, address, latitude, longitude, profession, donation_count, last_donation_date, age, health_notes, status FROM donors WHERE id = ?\`,
            [Number(donorId)]
        );
        if (results.length === 0) return res.json({ success: true, message: 'আপডেট সফল হয়েছে।' });
        res.json({ success: true, message: 'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে!', donorData: results[0] });
    } catch (err) {
        console.error('Donor profile update error:', err.message);
        res.status(500).json({ success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
    }
});`;

if (donorPattern.test(content)) {
    content = content.replace(donorPattern, donorReplacement);
    console.log('✅ Fixed donor update-profile');
} else {
    console.log('❌ Donor pattern not matched, doing line-based replace...');
    // Line-based approach
    const lines = content.split('\n');
    let startLine = -1;
    let endLine = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("UPDATE donors") && lines[i-3] && lines[i-3].includes("const query")) {
            startLine = i - 3;
        }
        if (startLine !== -1 && lines[i].trim() === '});' && i > startLine + 5) {
            // Check if previous closing brace is the db.query callback
            endLine = i;
            break;
        }
    }
    if (startLine !== -1 && endLine !== -1) {
        const before = lines.slice(0, startLine);
        const after = lines.slice(endLine + 1);
        const newBody = `    try {
        await dbQuery(
            \`UPDATE donors SET phone = ?, age = ?, profession = ?, location = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?\`,
            [phone, age || null, profession || null, location, address || null, latitude || null, longitude || null, Number(donorId)]
        );
        const results = await dbQuery(
            \`SELECT id, name, email, phone, blood_group, location, address, latitude, longitude, profession, donation_count, last_donation_date, age, health_notes, status FROM donors WHERE id = ?\`,
            [Number(donorId)]
        );
        if (results.length === 0) return res.json({ success: true, message: 'আপডেট সফল হয়েছে।' });
        res.json({ success: true, message: 'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে!', donorData: results[0] });
    } catch (err) {
        console.error('Donor profile update error:', err.message);
        res.status(500).json({ success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
    }
});`.split('\n');
        content = [...before, ...newBody, ...after].join('\n');
        console.log(`✅ Fixed donor update-profile (line-based, lines ${startLine}-${endLine})`);
    } else {
        console.log('❌ Could not find donor update-profile block at all');
    }
}

// Hospital: similar fix
const hospPattern = /    const query = `\n        UPDATE hospitals \n        SET icu_available = \?.*?\n        WHERE id = \?\n    `;\n    db\.query\(query, \[\n        [\s\S]*?\n    \], \(err\) => \{\n        if \(err\) return res\.status\(500\)\.json\(\{ success: false, message: '[\s\S]*?' \}\);\n        \n        db\.query\("SELECT id.*?FROM hospitals WHERE id = \?", \[Number\(hospitalId\)\], \(err, results\) => \{\n            if \(err \|\| results\.length === 0\) return res\.json\(\{ success: true, message: '[\s\S]*?' \}\);\n            res\.json\(\{ success: true, message: '[\s\S]*?', hospitalData: results\[0\] \}\);\n        \}\);\n    \}\);\n\}\);/;

const hospReplacement = `    try {
        await dbQuery(
            \`UPDATE hospitals SET icu_available = ?, emergency_bed_available = ?, phone = ?, contact_person = ?, location = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?\`,
            [Number(icuAvailable) || 0, Number(emergencyBedAvailable) || 0, phone || null, contactPerson || null, location, address || null, latitude || null, longitude || null, Number(hospitalId)]
        );
        const results = await dbQuery(
            \`SELECT id, name, email, phone, location, address, latitude, longitude, contact_person, license_number, icu_available, emergency_bed_available FROM hospitals WHERE id = ?\`,
            [Number(hospitalId)]
        );
        if (results.length === 0) return res.json({ success: true, message: 'আপডেট সফল হয়েছে।' });
        res.json({ success: true, message: 'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে!', hospitalData: results[0] });
    } catch (err) {
        console.error('Hospital profile update error:', err.message);
        res.status(500).json({ success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
    }
});`;

if (hospPattern.test(content)) {
    content = content.replace(hospPattern, hospReplacement);
    console.log('✅ Fixed hospital update-profile');
} else {
    // Line based
    console.log('❌ Hospital pattern not matched, trying line search...');
    const lines = content.split('\n');
    let startLine = -1, endLine = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("UPDATE hospitals") && lines[i-2] && lines[i-2].includes("const query")) {
            startLine = i - 2;
        }
        if (startLine !== -1 && i > startLine + 8 && lines[i].trim() === '});') {
            endLine = i;
            break;
        }
    }
    if (startLine !== -1 && endLine !== -1) {
        const before = lines.slice(0, startLine);
        const after = lines.slice(endLine + 1);
        const newBody = `    try {
        await dbQuery(
            \`UPDATE hospitals SET icu_available = ?, emergency_bed_available = ?, phone = ?, contact_person = ?, location = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?\`,
            [Number(icuAvailable) || 0, Number(emergencyBedAvailable) || 0, phone || null, contactPerson || null, location, address || null, latitude || null, longitude || null, Number(hospitalId)]
        );
        const results = await dbQuery(
            \`SELECT id, name, email, phone, location, address, latitude, longitude, contact_person, license_number, icu_available, emergency_bed_available FROM hospitals WHERE id = ?\`,
            [Number(hospitalId)]
        );
        if (results.length === 0) return res.json({ success: true, message: 'আপডেট সফল হয়েছে।' });
        res.json({ success: true, message: 'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে!', hospitalData: results[0] });
    } catch (err) {
        console.error('Hospital profile update error:', err.message);
        res.status(500).json({ success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
    }
});`.split('\n');
        content = [...before, ...newBody, ...after].join('\n');
        console.log(`✅ Fixed hospital update-profile (line-based, lines ${startLine}-${endLine})`);
    }
}

fs.writeFileSync('server.js', content, 'utf8');
console.log('Done.');
