const HttpError = require('../models/http-error');

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

const DUMMY_PLACES = [
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

router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError(`Could not find a place with id ${placeId}.`, 404);
  }

  console.log('GET /:pid Request in places');
  res.json({place});
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => p.creator === userId);

  if (!place) {
    return next(
        new HttpError(`Could not find a place with user id ${userId}.`, 404),
    );
  }

  console.log('GET /user/:uid Request in places');
  res.json({place});
});

module.exports = router;
