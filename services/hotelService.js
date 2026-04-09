const { request } = require('../utils/request');

function getCities() {
  return request({
    path: 'cities?select=*&is_active=eq.true&order=display_order.asc',
  });
}

function getHotelsByCityId(cityId) {
  return request({
    path: `hotels?select=*&city_id=eq.${cityId}&is_active=eq.true&order=safety_score.desc`,
  });
}

function transformCityData(dbCity) {
  return {
    id: dbCity.id,
    code: dbCity.code,
    name: dbCity.name,
    country: dbCity.country,
    latitude: Number(dbCity.latitude),
    longitude: Number(dbCity.longitude),
    region: {
      latitude: Number(dbCity.latitude),
      longitude: Number(dbCity.longitude),
      latitudeDelta: Number(dbCity.latitude_delta) || 0.1,
      longitudeDelta: Number(dbCity.longitude_delta) || 0.1,
    },
    zoomLevel: dbCity.zoom_level || 13,
    displayOrder: dbCity.display_order || 0,
  };
}

function transformCitiesData(dbCities) {
  if (!Array.isArray(dbCities)) return [];
  return dbCities.map(transformCityData);
}

function transformHotelData(dbHotel) {
  return {
    id: dbHotel.id,
    name: dbHotel.name,
    address: dbHotel.address,
    latitude: Number(dbHotel.latitude),
    longitude: Number(dbHotel.longitude),
    safetyScore: Number(dbHotel.safety_score) || 0,
    reviewCount: dbHotel.review_count || 0,
    bookingUrl: dbHotel.booking_url,
    phone: dbHotel.phone,
    description: dbHotel.description,
    isVerified: dbHotel.is_verified,
    cityId: dbHotel.city_id,
  };
}

function transformHotelsData(dbHotels) {
  if (!Array.isArray(dbHotels)) return [];
  return dbHotels.map(transformHotelData);
}

function generateHeatmapData(hotels) {
  if (!Array.isArray(hotels) || hotels.length === 0) return [];

  return hotels.map((hotel) => ({
    latitude: Number(hotel.latitude),
    longitude: Number(hotel.longitude),
    weight: Number(hotel.safetyScore || 0) / 5,
    intensity: Number(hotel.safetyScore || 0) / 5,
  }));
}

function groupCitiesByCountry(cities) {
  return cities.reduce((acc, city) => {
    if (!acc[city.country]) {
      acc[city.country] = [];
    }
    acc[city.country].push(city);
    return acc;
  }, {});
}

module.exports = {
  getCities,
  getHotelsByCityId,
  transformCityData,
  transformCitiesData,
  transformHotelData,
  transformHotelsData,
  generateHeatmapData,
  groupCitiesByCountry,
};
