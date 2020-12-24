const {v4: uuid} = require('uuid');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');
const User = require('../models/user');

/**
 * Users Controller Middleware
 *
 */

// TODO: Use database instead...
const DUMMY_USERS = [
  {
    email: 'test1@test.com',
    id: 'u1',
    name: 'Alice',
    password: 'Password123!',
  },
  {
    email: 'test2@test.com',
    id: 'u2',
    name: 'Bob',
    password: 'Password123!',
  },
];

/**
 * Get all users
 * @param req
 * @param res
 * @param next
 */
const getUsers = async (req, res, next) => {
  let users;
  try {
    // Get all but the passwords
    users = await User.find({}, '-password');
  } catch (e) {
    return next(
        new HttpError('Failed to get users, please try again later', 500)
    );
  }

  res.status(200);
  res.json({
    users: users.map(u => u.toObject({getters: true})),
  });
};

/**
 * Get a user by their UID
 * @param req
 * @param res
 * @param next
 */
const getUser = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.find({id: userId});
  } catch (e) {
    return next(new HttpError('Error getting user by id', 500));
  }

  res.status(200);
  res.json({
    user: user.toObject({getters: true}),
  });
};

/**
 * Register a user using request body values
 * @param req
 * @param res
 * @param next
 */
const signup = async (req, res, next) => {
  // Get the validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid input', 422)); // Invalid input
  }

  const {
    email,
    name,
    password,
    places,
  } = req.body;

  // Enforce unique email
  let existingUser;
  try {
    existingUser = await User.findOne({email: email}); // Return on first find
  } catch (e) {
    return next(new HttpError('Error check user email', 500));
  }

  if (existingUser) {
    return next(new HttpError('Email address taken', 422)); // Invalid user input
  }

  const createdUser = new User({
    email,
    image: 'https://www.dailymoss.com/wp-content/uploads/2019/08/funny-profile-pic59.jpg',
    name,
    password,
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Sign up failed, please try again later', 500));
  }

  res.status(201); // Created
  res.json({
    user: createdUser.toObject({getters: true}),
  });
};

/**
 * Sign a user in
 * @param req
 * @param res
 * @param next
 */
const login = async (req, res, next) => {
  const {
    email,
    password,
  } = req.body;

  // Match email, then password
  let identifiedUser;
  try {
    identifiedUser = await User.findOne({email: email}); // Return on first find
  } catch (e) {
    return next(new HttpError('Error logging in, please try again later', 500));
  }

  // Check password
  if (!identifiedUser || identifiedUser.password !== password) {
    return next(new HttpError('Invalid credentials', 401)); // Unauthorised
  }

  res.status(200);
  res.json({message: 'Logged in!'});
};

exports.getUser = getUser;
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
