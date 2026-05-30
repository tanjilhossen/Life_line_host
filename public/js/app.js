function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]
    ));
}

/* ===== Load Stats ===== */
async function loadStats() {
    try {
        const [hosRes] = await Promise.allSettled([fetch('/api/hospitals')]);
        if (hosRes.status === 'fulfilled') {
            const data = await hosRes.value.json();
            if (data.success) {
                const el = document.getElementById('statHospitals');
                if (el) el.textContent = data.data.length;
            }
        }
    } catch (_) {}
    // Placeholder stats animation
    animateCount('statDonors', 120);
    animateCount('statAlerts', 340);
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let cur = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur + '+';
        if (cur >= target) clearInterval(t);
    }, 35);
}

/* ===== Load Hospitals ===== */
async function loadHospitals() {
    try {
        const response = await fetch('/api/hospitals');
        const result = await response.json();

        const hospitalList = document.getElementById('hospitalList');
        if (!hospitalList) return;

        hospitalList.innerHTML = '';

        if (result.success && result.data.length > 0) {
            result.data.forEach(hospital => {
                // Card
                const div = document.createElement('div');
                div.className = 'hosp-card';
                div.innerHTML = `
                    <div class="hosp-avatar">🏥</div>
                    <div class="hosp-info">
                        <div class="hosp-name">${escapeHtml(hospital.name)}</div>
                        <div class="hosp-loc">📍 ${escapeHtml(hospital.location)}</div>
                    </div>
                    <div class="hosp-beds">
                        <div class="bed-badge bed-icu">ICU: ${escapeHtml(String(hospital.icu_available))}</div>
                        <div class="bed-badge bed-em">EM: ${escapeHtml(String(hospital.emergency_bed_available))}</div>
                    </div>
                `;
                hospitalList.appendChild(div);

                // Add Mapbox marker
                if (window._hospMapReady && window._addHospMarker) {
                    window._addHospMarker(hospital);
                }
            });

            // Update hospital count
            const el = document.getElementById('statHospitals');
            if (el) el.textContent = result.data.length;

            // If map not ready yet, queue markers
            if (!window._hospMapReady) {
                window._pendingHospMarkers = () => {
                    result.data.forEach(h => {
                        if (window._addHospMarker) window._addHospMarker(h);
                    });
                };
            }

        } else {
            hospitalList.innerHTML = '<p style="color:#e11d48;text-align:center;padding:20px;font-weight:600">এই মুহূর্তে কোনো হাসপাতালের ডেটা পাওয়া যায়নি।</p>';
        }
    } catch (error) {
        console.error('Error loading hospitals:', error);
    }
}

/* ===== Emergency Form ===== */
const emergencyForm = document.getElementById('emergencyForm');
if (emergencyForm) {
    emergencyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bloodGroup = document.getElementById('bloodGroup').value;
        const district = document.getElementById('location').value;
        const upazila = document.getElementById('upazila') ? document.getElementById('upazila').value : '';
        const location = upazila ? `${upazila}, ${district}` : district;
        const hospitalName = document.getElementById('hospitalName').value;
        const neededTime = document.getElementById('neededTime').value;
        const patientDisease = document.getElementById('patientDisease').value;
        const contactNumber = document.getElementById('contactNumber').value;
        const selectedLocation = window.selectedRequestLocation || {};
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;

        if (!district || !selectedLocation.latitude || !selectedLocation.longitude) {
            await showPopup('জেলা নির্বাচন করুন এবং ম্যাপে সঠিক অবস্থান চিহ্নিত করুন।', 'warning');
            return;
        }

        submitBtn.innerHTML = '⏳ অ্যালার্ট পাঠানো হচ্ছে...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/emergency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bloodGroup,
                    district,
                    upazila,
                    location,
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    hospitalName,
                    neededTime,
                    patientDisease,
                    contactNumber
                })
            });
            const result = await response.json();
            if (result.success && result.trackingUrl) {
                window.location.href = result.trackingUrl;
                return;
            }
            await showPopup(result.message, 'warning');
        } catch (error) {
            await showPopup('সার্ভারে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করুন।', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Init
loadStats();
loadHospitals();
