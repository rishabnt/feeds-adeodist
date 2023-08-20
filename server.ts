import { Request, Response, NextFunction } from 'express';
// const path = require('path');
const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const port = process.env.PORT || 5000
const { connectToDB } = require('./config/db')
const { errorHandler } = require('./middleware/errorMiddleware');

// Connect to DB using connection configuration from config/db.ts
connectToDB();

// Initialize express variable
const app = express();

// Set express to use JSON and URL encoded features
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set Header to enable API to receive requests from all origins
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    ); 
    res.header(
        'Access-Control-Allow-Methods', 
        'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    );
    next();
});

// Link general feed and user routes to the respective route files and functions
app.use('/api/feeds', require('./routes/feedRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));

// Set express to use error handler middleware
app.use(errorHandler);

// Set express to listen on configured Port and log message on server start
app.listen(port, () => console.log(`Server started on port ${port}`));