const express = require('express');
const bodyParse = require('body-parser')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const app = express();

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((err, req,res,next) => {
  if (res.headerSent) {
    return next(err);
  }

  res.status(err.code || 500);
  res.json({message: err.message || 'An unknown error occurred.' });
});

app.listen(5000);
