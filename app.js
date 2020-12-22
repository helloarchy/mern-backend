const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const HttpError = require('./models/http-error')
const {getConfig} = require('./config/config');

/**
 * Middleware loaded top-down!
 * Parse JSON before routing requests
 * Then next, next, next to use following middleware
 */
const app = express();
app.use(bodyParser.json())
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404)
})

app.use((err, req,res,next) => {
  if (res.headerSent) {
    return next(err);
  }

  res.status(err.code || 500);
  res.json({message: err.message || 'An unknown error occurred.' });
});

// Connect to DB, if OK, run server, otherwise error
const config = getConfig()
const connectionString =
    "mongodb+srv://" +
    encodeURIComponent(config.dbUserName) +
    ":" +
    encodeURIComponent(config.dbPassword) +
    "@cluster0.ybxfd.mongodb.net/" +
    config.dbName +
    "?retryWrites=true&w=majority"

mongoose
  .connect(connectionString)
  .then(() => {
  app.listen(5000);
})
  .catch(err => {
  console.log(err);
})
