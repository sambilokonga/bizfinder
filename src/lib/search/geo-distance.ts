/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (
    lat1 === undefined ||
    lat1 === null ||
    lon1 === undefined ||
    lon1 === null ||
    lat2 === undefined ||
    lat2 === null ||
    lon2 === undefined ||
    lon2 === null
  ) {
    return Infinity;
  }

  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a distance in kilometers into a friendly human-readable string.
 * Example: 0.35 km -> "350 m", 2.45 km -> "2.5 km"
 */
export function formatDistance(distanceKm: number): string {
  if (!isFinite(distanceKm) || distanceKm < 0) return "--";
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Checks if a coordinate is within the given geographic bounding box.
 */
export function isWithinBounds(
  lat: number,
  lng: number,
  bounds?: { north: number; south: number; east: number; west: number }
): boolean {
  if (!bounds) return true;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

/**
 * Calculates a bounding box (north, south, east, west) from a center point and radius.
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): { north: number; south: number; east: number; west: number } {
  const earthRadius = 6371; // km
  const deltaLat = (radiusKm / earthRadius) * (180 / Math.PI);
  const deltaLng =
    (radiusKm / (earthRadius * Math.cos(toRad(lat)))) * (180 / Math.PI);

  return {
    north: lat + deltaLat,
    south: lat - deltaLat,
    east: lng + deltaLng,
    west: lng - deltaLng,
  };
}

/**
 * Sort items by proximity to user coordinates.
 */
export function sortByDistance<T>(
  items: T[],
  userLat: number,
  userLng: number,
  getCoords: (item: T) => { lat?: number | null; lng?: number | null }
): (T & { distanceKm: number; formattedDistance: string })[] {
  return items
    .map((item) => {
      const coords = getCoords(item);
      const distanceKm = calculateDistanceKm(
        userLat,
        userLng,
        coords.lat,
        coords.lng
      );
      return {
        ...item,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Filters items within a specified radius from user coordinates.
 */
export function filterWithinRadius<T>(
  items: T[],
  userLat: number,
  userLng: number,
  radiusKm: number,
  getCoords: (item: T) => { lat?: number | null; lng?: number | null }
): (T & { distanceKm: number; formattedDistance: string })[] {
  const withDistance = sortByDistance(items, userLat, userLng, getCoords);
  return withDistance.filter((item) => item.distanceKm <= radiusKm);
}

/**
 * Approximate travel time estimates (average urban speed)
 */
export function estimateWalkingMinutes(distanceKm: number): number {
  const walkingSpeedKmH = 4.8; // ~4.8 km/h
  return Math.max(1, Math.round((distanceKm / walkingSpeedKmH) * 60));
}

export function estimateDrivingMinutes(distanceKm: number): number {
  const urbanDrivingSpeedKmH = 28; // ~28 km/h urban traffic average
  return Math.max(1, Math.round((distanceKm / urbanDrivingSpeedKmH) * 60));
}

