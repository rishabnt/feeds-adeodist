"use strict";
exports.__esModule = true;
// const path = require('path');
var express = require('express');
var colors = require('colors');
var dotenv = require('dotenv').config();
var port = process.env.PORT || 5000;
var connectDB = require('./config/db');
var errorHandlerMiddleware = require('./middleware/errorMiddleware');
// Connect to DB using connection configuration from config/db.ts
connectDB();
// Initialize express variable
var app = express();
// Set express to use JSON and URL encoded features
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Set Header to enable API to receive requests from all origins
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    next();
});
// Link general feed and user routes to the respective route files and functions
app.use('/api/feeds', require('./routes/feedRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// Set express to use error handler middleware
app.use(errorHandlerMiddleware);
// Set express to listen on configured Port and log message on server start
app.listen(port, function () { return console.log("Server started on port ".concat(port)); });
