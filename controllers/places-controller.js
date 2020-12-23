const {v4: uuid} = require('uuid');
const {validationResult} = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

/**
 * Places Controller Middleware
 * ---
 * Handle all logic and resolve places requests and responses, providing
 * functions for places-routes.
 */

// TODO: Temporary until DB added
let DUMMY_PLACES = [
  {
    'address': 'Tower Bridge Rd, London SE1 2UP',
    'creator': 'u1',
    'description': 'A nice tower description',
    'id': 'p1',
    'imageUrl': 'https://www.swedishnomad.com/wp-content/images/2020/03/Tower-Bridge.jpg',
    'location': {
      'lat': 51.505455,
      'lng': -0.075356,
    },
    'title': 'Tower Bridge',
  },
  {
    'address': 'Tower Bridge Rd, London SE1 2UP',
    'creator': 'u2',
    'description': 'An even nicer tower description',
    'id': 'p2',
    'imageUrl': 'https://www.swedishnomad.com/wp-content/images/2020/03/Tower-Bridge.jpg',
    'location': {
      'lat': 51.505455,
      'lng': -0.075356,
    },
    'title': 'Tower Bridge',
  },
];

/**
 * Get place by PID
 * @param req
 * @param res
 */
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    return next(new HttpError('Invalid input', 500));
  }

  if (!place) {
    return next(
        new HttpError(`Could not find a place with id ${placeId}.`, 404));
  }

  console.log('GET /:pid Request in places');
  res.json({
    place: place.toObject({getters: true}),
  });
};

/**
 * GET all places for a user by their UID
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  // Filter to get only places with matching UID
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (!places || !places.length) {
    return next(
        new HttpError(`Could not find a place with user id ${userId}.`, 404),
    );
  }

  res.status(200);
  res.json({places});
};

/**
 * Create a place via POST body
 * @param req
 * @param res
 * @param next
 */
const createPlace = async (req, res, next) => {
  // Get the validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid input', 422)); // Invalid user input (throw doesn't work in async)
  }

  const {
    title,
    description,
    address,
    creator,
  } = req.body; // Extracted from Body Parser TODO: Validate!

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error); // Stop further execution
  }

  // Using Mongoose schema template
  const createdPlace = new Place({
    address,
    creator,
    description,
    image: 'https://www.swedishnomad.com/wp-content/images/2020/03/Tower-Bridge.jpg',
    location: coordinates, // Lat, Long...
    title,
  });

  try {
    await createdPlace.save(); // Does everything to write to db...
  } catch (err) {
    const error = new HttpError('Failed to create place', 500);
    return next(error);
  }

  res.status(201); // Successfully created
  res.json({
    place: createdPlace.toObject({getters: true}),
  });
};

/**
 * Update a place using the PID from param and values from body.
 * @param res
 * @param req
 */
const updatePlace = (req, res) => {
  // Get the validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid input', 422); // Invalid input
  }

  const {title, description} = req.body;
  const placeId = req.params.pid;

  const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)}; // Create a copy
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId); // Get index

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace; // Update with copy

  res.status(200);
  res.json({place: updatedPlace});
};

/**
 * Delete a place via PID
 * @param req
 * @param res
 */
const deletePlace = (req, res) => {
  const placeId = req.params.pid;

  // Check for place before deleting
  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Place not found', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId); // Return array excluding place

  res.status(200);
  res.json({message: 'Place deleted'});
};

// Export functions
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
