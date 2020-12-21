const express = require('express');

const placesController = require("../controllers/places-controller");

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/:pid', placesController.getPlaceById);
router.get('/user/:uid', placesController.getPlaceByUserId);

router.post('/', placesController.createPlace); // POST

module.exports = router;
