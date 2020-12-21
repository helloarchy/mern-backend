const express = require('express');
const placeControllers = require('../controllers/places-controller');

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  deletePlace,
} = require('../controllers/places-controller');

// eslint-disable-next-line new-cap
const router = express.Router();

// GET
router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);

// POST
router.post('/', createPlace);

// PATCH
router.patch('/:pid', placeControllers.updatePlace);

// DELETE
router.delete('/:pid', deletePlace);

module.exports = router;
