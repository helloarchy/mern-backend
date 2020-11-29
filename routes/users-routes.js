const express = require('express')

const router = express.Router();

const DUMMY_USERS = [
  {
    id: 'u1',
    image: 'https://www.onthisday.com/images/people/john-smith-medium.jpg',
    name: 'John Smith',
    places: 3
  },
  {
    id: 'u2',
    image: 'https://lezwatchtv.com/wp-content/uploads/2016/03/questionmarkface-350x412.jpg',
    name: 'Jane Doseydo',
    places: 5
  }
];

router.get('/:uid', (req, res) => {
  const userId = req.params.uid
  const user = DUMMY_USERS.find((u) => u.id === userId)

  console.log('GET request in users');
  res.json({
    'message': 'It works?',
    user
  })
})

module.exports = router
