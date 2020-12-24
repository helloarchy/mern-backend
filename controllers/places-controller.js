const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

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
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // Filter to get only places with matching UID
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (e) {
    return next(
        new HttpError('Failed to fetch places, please try again later', 500));
  }

  if (!userWithPlaces || !userWithPlaces.places.length) {
    return next(
        new HttpError(`Could not find a place with user id ${userId}.`, 404),
    );
  }

  const updated = userWithPlaces.places.map(p => p.toObject({getters: true}));

  res.status(200);
  res.json({
    places: updated,
  });
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
    creator, // User ID
  } = req.body; // Extracted from Body Parser TODO: Validate!

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error); // Stop further execution
  }

  // Check User ID exists
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
        new HttpError('Failed creating place, please try again later', 500),
    );
  }

  if (!user) {
    return next(
        new HttpError('User ID does not exist', 422),
    );
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
    // Use session to track transaction for multiple operations and allow us to undo if fail
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({session: session});
    user.places.push(createdPlace); // Mongoose push (very clever!)
    await user.save({session: session});
    await session.commitTransaction(); // Changes finally saved in db
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
const updatePlace = async (req, res, next) => {
  // Get the validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid input', 422)); // Invalid input
  }

  const {title, description} = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    return next(new HttpError('Invalid input', 500));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save(); // Update the place in db
  } catch (err) {
    const error = new HttpError('Failed to create place', 500);
    return next(error);
  }

  res.status(200);
  res.json({place: place.toObject({getters: true})});
};

/**
 * Delete a place via PID
 * @param req
 * @param res
 * @param next
 */
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  // Check for place before deleting
  let place;
  try {
    place = await Place.findById(placeId).populate('creator'); // User relation
  } catch (e) {
    return next(new HttpError('Invalid input', 500));
  }

  // Check place ID exists
  if (!place) {
    return next(
        new HttpError(`Failed to find place with id ${placeId}`, 404),
    );
  }

  try {
    await place.remove(); // Delete the place
    // Use session to track transaction for multiple operations and allow us to undo if fail
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({session: session});
    place.creator.places.pull(place); // Mongoose pull (very clever!)
    await place.creator.save({session: session});
    await session.commitTransaction(); // Changes finally saved in db
  } catch (e) {
    return next(
        new HttpError('Failed deleting place, please try again later', 500));
  }

  res.status(200);
  res.json({message: 'Place deleted'});
};

// Export functions
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
