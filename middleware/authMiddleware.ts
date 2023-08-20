import { Request, Response, NextFunction } from 'express';const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { findUsersByColumn } = require('../config/db.ts');

import { User } from '../interface/user.interface';

const feedProtect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get auth token from request header
            token = req.headers.authorization?.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = (await findUsersByColumn("ID", decoded.id))[0];

            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not Authorized');
        }
    }

    if(!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

})

const userProtect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log("Sup bro");
    let token: string | undefined;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get auth token from request header
            token = req.headers.authorization?.split(' ')[1];

            // Verify token
            console.log(token);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = (await findUsersByColumn("ID", decoded.id))[0];

            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not Authorized');
        }
    }

    if(!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

})

module.exports = { feedProtect, userProtect };