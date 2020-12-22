const express = require('express');
const {check} = require('express-validator');

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/places-controller');

// eslint-disable-next-line new-cap
const router = express.Router();

// GET
router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);

// POST
router.post('/', [
  // TODO: Coordinates ignored
  check('title').not().isEmpty(),
  check('description').isLength({
    min: 5
  }),
  check('address').not().isEmpty(),
  check('creator').not().isEmpty(),
], createPlace);

// PATCH
router.patch('/:pid', [
  check('title').not().isEmpty(),
  check('description').isLength({
    min: 5,
    max: 100,
  }),
], updatePlace);

// DELETE
router.delete('/:pid', deletePlace);

module.exports = router;
