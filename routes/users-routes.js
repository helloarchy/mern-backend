const express = require('express');
const {
  getUser,
  getUsers,
  signup,
  login,
} = require('../controllers/users-controller');

const router = express.Router();

// GET
router.get('/', getUsers);
router.get('/:uid', getUser);

// POST
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
