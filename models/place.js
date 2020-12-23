const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  // Blueprint for a place
  address: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: { // href
    type: String,
    required: true,
  },
  location: {
    lat: {
      type: String,
      required: true,
    },
    lng: {
      type: String,
      required: true,
    },
  },
  title: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Place', placeSchema);
