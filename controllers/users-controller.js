const {v4: uuid} = require('uuid');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator')
const User = require('../models/user')

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
    users = await User.find({});
  } catch (e) {
    return next(new HttpError('Error getting users', 500));
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
    user: user.toObject({getters: true})
  });
};

/**
 * Register a user using request body values
 * @param req
 * @param res
 * @param next
 */
const signup = (req, res, next) => {
  // Get the validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid input', 422); // Invalid input
  }

  const {
    email,
    name,
    password,
  } = req.body;

  // Enforce unique email
  const hasUser = DUMMY_USERS.find(u => u.email === email)
  if (hasUser) {
    throw new HttpError('Email address taken', 422) // Invalid user input
  }

  const createdUser = {
    email,
    id: uuid(),
    name,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201); // Created
  res.json({user: createdUser});
};

/**
 * Sign a user in
 * @param req
 * @param res
 */
const login = (req, res) => {
  const {
    email,
    password,
  } = req.body;

  // Match email, then password
  const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError('Invalid credentials', 401); // Unauthorised
  }

  res.status(200);
  res.json({message: 'Logged in!'});
};

exports.getUser = getUser;
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
