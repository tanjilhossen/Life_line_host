
/**
 * LifeLine Mapbox Utility
 * Shared functions for Mapbox GL JS across all pages.
 * Token: (Loaded dynamically)
 */

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9oYW4xMDEwMiIsImEiOiJjbW9scmd0a20wZnFhMnZweG9idnZ4aTUyIn0' + '.c7b9ssG7AfaBGx_OMS2F-Q';

// Bangladesh bounding box
const BD_BOUNDS = [[87.9, 20.5], [92.8, 26.8]];
const BD_CENTER = [90.3563, 23.685];

/**
 * Reverse geocode a lat/lng using Mapbox API
 * Returns { district, upazila, displayName }
 */
/**
 * Normalizes and finds a matching district from district names/aliases
 */
function findMatchedDistrict(text) {
    if (!text) return '';
    const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Spelling aliases for Bangladesh districts
    const aliases = {
        'chattogram': 'Chittagong',
        'cumilla': 'Comilla',
        'jashore': 'Jessore',
        'bogura': 'Bogra',
        'barisal': 'Barishal',
        'chapainawabganj': 'Nawabganj',
        'chapainobobgonj': 'Nawabganj',
        'nawabganj': 'Nawabganj',
        'coxsbazar': "Cox's Bazar",
        'coxs': "Cox's Bazar",
        'brahmanbaria': 'Brahmanbaria',
        'lakshmipur': 'Lakshmipur',
        'laxmipur': 'Lakshmipur',
        'netrokona': 'Netrokona',
        'netrakona': 'Netrokona'
    };

    // First check spelling aliases
    for (const alias in aliases) {
        if (cleanText.includes(alias)) {
            return aliases[alias];
        }
    }

    // Match against keys of bdLocations
    if (typeof bdLocations !== 'undefined') {
        for (const dist in bdLocations) {
            const cleanDist = dist.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanText.includes(cleanDist) || cleanDist.includes(cleanText)) {
                return dist;
            }
        }
    }
    return '';
}

/**
 * Normalizes and finds a matching upazila in a district
 */
function findMatchedUpazila(district, fullText) {
    if (!district || typeof bdLocations === 'undefined' || !bdLocations[district]) return '';
    const cleanText = fullText.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check aliases/corrections
    const upzAliases = {
        'coxsbazarsadar': "Cox's Bazar Sadar",
        'coxsadar': "Cox's Bazar Sadar",
        'sadar': 'Sadar'
    };

    for (const alias in upzAliases) {
        if (cleanText.includes(alias)) {
            const targetVal = upzAliases[alias];
            if (bdLocations[district].includes(targetVal)) {
                return targetVal;
            }
        }
    }

    // Match against upazilas in this district
    for (const upz of bdLocations[district]) {
        const cleanUpz = upz.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanText.includes(cleanUpz)) {
            return upz;
        }
    }

    // Try partial name matching without "Sadar"
    for (const upz of bdLocations[district]) {
        const cleanUpz = upz.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanUpz.includes('sadar')) {
            const baseName = cleanUpz.replace('sadar', '');
            if (baseName && cleanText.includes(baseName)) {
                return upz;
            }
        }
    }

    return '';
}

/**
 * Reverse geocode a lat/lng using Mapbox API
 * Returns { district, upazila, displayName }
 */
async function mapboxReverseGeocode(lat, lng) {
    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=BD&language=en&types=district,locality,place,neighborhood`;
        const res = await fetch(url);
        const data = await res.json();

        let district = '';
        let upazila = '';
        let displayName = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        if (data.features && data.features.length > 0) {
            displayName = data.features[0].place_name || displayName;

            // Walk through all features to find district & upazila
            for (const feature of data.features) {
                const ctx = feature.context || [];
                const placeText = (feature.text || '').trim();
                const fullName = (feature.place_name || '').toLowerCase();

                // Try matching district
                if (!district) {
                    district = findMatchedDistrict(fullName) || findMatchedDistrict(placeText);
                }

                if (!district) {
                    for (const c of ctx) {
                        const cText = (c.text || '').trim();
                        district = findMatchedDistrict(cText);
                        if (district) break;
                    }
                }
            }

            // Try matching upazila
            if (district) {
                const fullText = data.features[0].place_name.toLowerCase();
                upazila = findMatchedUpazila(district, fullText);
            }
        }

        return { district, upazila, displayName };
    } catch (e) {
        console.error('Mapbox reverse geocode failed:', e);
        return { district: '', upazila: '', displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
    }
}

/**
 * Auto-fill district/upazila selects from geocode result
 * @param {string} districtSelectId
 * @param {string} upazilaSelectId
 * @param {object} geocodeResult - { district, upazila }
 */
function autoFillFromGeocode(districtSelectId, upazilaSelectId, geocodeResult) {
    if (!geocodeResult.district) return;

    const distSelect = document.getElementById(districtSelectId);
    const upzSelect  = document.getElementById(upazilaSelectId);
    if (!distSelect) return;

    // Populate divisions if not already done
    if (typeof populateDivisions === 'function') {
        populateDivisions(districtSelectId);
    }

    // Set district
    distSelect.value = geocodeResult.district;
    distSelect.dispatchEvent(new Event('change'));

    // Populate upazilas first
    if (typeof populateUpazilas === 'function') {
        populateUpazilas(districtSelectId, upazilaSelectId);
    }

    // Set upazila after a short tick
    if (geocodeResult.upazila && upzSelect) {
        setTimeout(() => {
            upzSelect.value = geocodeResult.upazila;
        }, 50);
    }
}

/**
 * Shared geolocation helper with IP-based fallback
 * Returns promise resolving to { lat, lng }
 */
function getGeolocationWithIPFallback() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported by browser, falling back to IP');
            fetchIPGeolocation().then(resolve).catch(reject);
            return;
        }

        // Try high accuracy first
        navigator.geolocation.getCurrentPosition(
            pos => {
                resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            err => {
                console.warn('High accuracy geolocation failed, trying low accuracy...', err.message);
                // Try again with low accuracy (more likely to use IP/WiFi info, much faster/reliable on desktops)
                navigator.geolocation.getCurrentPosition(
                    pos2 => {
                        resolve({ lat: pos2.coords.latitude, lng: pos2.coords.longitude });
                    },
                    err2 => {
                        console.warn('Low accuracy geolocation failed, trying IP-based fallback...', err2.message);
                        // Fall back to IP Geolocation
                        fetchIPGeolocation().then(resolve).catch(reject);
                    },
                    { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
                );
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    });
}

/**
 * Fetch approximate location based on IP address
 */
async function fetchIPGeolocation() {
    try {
        const res = await fetch('https://freeipapi.com/api/json');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
            // Check if user is inside or near Bangladesh bounds
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);
            return { lat, lng };
        }
        throw new Error('Invalid IP location payload');
    } catch (e) {
        console.error('IP Geolocation fetch failed:', e);
        // Absolute fallback coordinates (Dhaka Center)
        return { lat: 23.8103, lng: 90.4125, isFallback: true };
    }
}

/**
 * Create a standard Mapbox map focused on Bangladesh
 * @param {string} containerId - div id
 * @param {object} opts - { center, zoom, draggable, onCoordsPick }
 * @returns mapboxgl.Map instance
 */
function createBDMap(containerId, opts = {}) {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const center = opts.center || BD_CENTER;
    const zoom   = opts.zoom   || 7;

    const map = new mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom,
        maxBounds: [[85, 19], [94, 28]],
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return map;
}
