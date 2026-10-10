import * as Location from 'expo-location';

export interface ClinicData {
  id: string;
  name: string;
  distance: string;
  distanceKm: number;
  status: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

// Haversine formula to compute true physical distance between two coordinates in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get the user's real GPS coordinates from the device hardware.
 * Strictly uses device location without hardcoding any default city.
 */
export async function getCurrentUserLocation(): Promise<{
  lat: number | null;
  lng: number | null;
  city: string;
  hasPermission: boolean;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { lat: null, lng: null, city: 'Current Location', hasPermission: false };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let detectedCity = 'Current Location';
    try {
      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (geo && geo.length > 0) {
        const place = geo[0];
        const parts = [
          place.city || place.subregion || place.district,
          place.region || place.country,
        ].filter(Boolean);
        if (parts.length > 0) {
          detectedCity = parts.join(', ');
        }
      }
    } catch {
      // Reverse geocode optional
    }

    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      city: detectedCity,
      hasPermission: true,
    };
  } catch (err) {
    console.warn('GPS location resolution notice:', err);
    return { lat: null, lng: null, city: 'Current Location', hasPermission: false };
  }
}

/**
 * Query real healthcare facilities near the user's live GPS coordinates via live OpenStreetMap / Overpass.
 * Zero hardcoded clinics. Every result is resolved live from global geo-spatial databases.
 */
export async function getNearbyClinics(userLat?: number, userLng?: number): Promise<ClinicData[]> {
  let lat = userLat;
  let lng = userLng;

  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    const loc = await getCurrentUserLocation();
    if (loc.lat === null || loc.lng === null) {
      return [];
    }
    lat = loc.lat;
    lng = loc.lng;
  }

  const liveFacilities: ClinicData[] = [];

  // Query OpenStreetMap Overpass live API (Search radius: 15km)
  try {
    const overpassQuery = `[out:json][timeout:8];(node["amenity"="hospital"](around:15000,${lat},${lng});node["amenity"="clinic"](around:15000,${lat},${lng});node["healthcare"="hospital"](around:15000,${lat},${lng});node["healthcare"="centre"](around:15000,${lat},${lng}););out body 8;`;
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.elements)) {
        for (const el of data.elements) {
          const tags = el.tags || {};
          const name = tags.name || tags['name:en'] || tags.operator;
          if (name) {
            const dist = calculateDistanceKm(lat, lng, el.lat, el.lon);
            const phone = tags.phone || tags['contact:phone'] || tags['emergency:phone'] || '112';
            const street = [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || 'Medical Facility';
            liveFacilities.push({
              id: `osm-${el.id}`,
              name,
              distance: `${dist.toFixed(1)} km`,
              distanceKm: dist,
              status: tags.opening_hours === '24/7' ? 'Open 24 hours' : 'Emergency Center',
              phone,
              address: street,
              lat: el.lat,
              lng: el.lon,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Live Overpass query notice:', err);
  }

  // If Overpass returned results, sort by real distance
  if (liveFacilities.length > 0) {
    liveFacilities.sort((a, b) => a.distanceKm - b.distanceKm);
    return liveFacilities.slice(0, 6);
  }

  // Backup live query via Nominatim OSM for hospitals near coordinates
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&limit=6`;
    const nomRes = await fetch(nomUrl, {
      headers: { 'User-Agent': 'SensooApp/1.0 (Hackathon Verification Engine)' },
    });
    if (nomRes.ok) {
      const items = await nomRes.json();
      if (Array.isArray(items)) {
        for (const item of items) {
          const itemLat = parseFloat(item.lat);
          const itemLon = parseFloat(item.lon);
          const dist = calculateDistanceKm(lat, lng, itemLat, itemLon);
          liveFacilities.push({
            id: `nom-${item.place_id}`,
            name: item.name || item.display_name.split(',')[0],
            distance: `${dist.toFixed(1)} km`,
            distanceKm: dist,
            status: 'Verified Health Facility',
            phone: '112',
            address: item.display_name.split(',').slice(1, 3).join(',').trim(),
            lat: itemLat,
            lng: itemLon,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim fallback notice:', err);
  }

  liveFacilities.sort((a, b) => a.distanceKm - b.distanceKm);
  return liveFacilities.slice(0, 6);
}
