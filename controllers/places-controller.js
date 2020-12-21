const {v4: uuid} = require('uuid');
const HttpError = require('../models/http-error');

/**
 * Places Middleware
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
const getPlaceById = (req, res) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError(`Could not find a place with id ${placeId}.`, 404);
  }

  console.log('GET /:pid Request in places');
  res.json({place});
}


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

  res.status(200)
  res.json({places});
}


/**
 * Create a place via POST body
 * @param req
 * @param res
 * @param next
 */
const createPlace = (req, res, next) => {
  const {
    title,
    description,
    coordinates,
    address,
    creator,
  } = req.body; // Extracted from Body Parser TODO: Validate!

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates, // Lat, Long...
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201); // Successfully created
  res.json({place: createdPlace})
}


/**
 * Update a place using the PID from param and values from body.
 * @param res
 * @param req
 * @param next
 */
const updatePlace = (req, res, next) => {
  const {title, description} = req.body
  const placeId = req.params.pid

  const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)} // Create a copy
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId) // Get index

  updatedPlace.title = title
  updatedPlace.description = description

  DUMMY_PLACES[placeIndex] = updatedPlace // Update with copy

  res.status(200)
  res.json({place: updatedPlace})
}


/**
 * Delete a place via PID
 * @param req
 * @param res
 * @param next
 */
const deletePlace = (req, res, next) => {
  const placeId = req.params.pid
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId) // Return array excluding place

  res.status(200)
  res.json({message: 'Place deleted'})
}


// Export functions
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
