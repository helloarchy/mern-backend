const placesController = require("../controllers/places-controller");

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();



router.get('/:pid', placesController.getPlaceById);

router.get('/user/:uid', placesController.getPlaceByUserId);

module.exports = router;
