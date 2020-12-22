const axios = require('axios'); // For sending http requests

const {getConfig: getConfig} = require('../config/config');

const HttpError = require('../models/http-error');


const API_KEY = getConfig().apiKey

async function getCoordsForAddress(address) {
  /*return {
    lat: '',
    lng: ''
  };*/

  const googleMapsApiUri = 'https://maps.googleapis.com/maps/api/geocode/json';
  const encodedAddress = encodeURIComponent(address);
  const endpoint = `${googleMapsApiUri}?address=${encodedAddress}&key=${API_KEY}`;

  const response = await axios.get(endpoint);

  const data = response.data;

  // Google offer a ZERO_RESULTS status iff nothing found
  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError('Cannot find location for address', 422)
  }

  return data.results[0].geometry.location
}

module.exports = getCoordsForAddress;
