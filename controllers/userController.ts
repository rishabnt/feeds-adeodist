const userJwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { logger } = require('../logger');

import { User } from '../interface/user.interface';
import { Request, Response, NextFunction } from 'express';
const { findAllUsers, findUsersByColumn, createUser, updateUser, removeUser } = require('../config/db');

// @desc Register new user
// @route POST /addUser
// @access Public
const getUser = asyncHandler(async (req: Request, res: Response) => {
    const {key, value} = req.body;

    if(!key || !value) {
        res.status(400);
        logger.error("/api/users/getUser - Please enter required parameters")
        throw new Error("Please enter required parameters")
    }


    let users = await findUsersByColumn(key, value);
    // Filtering results based on authorization
    switch(req.user.role) {
        case 'super-admin':
            break;
        case 'admin':
            users = users.filter((user: User) => user.role === 'admin');
            break;
        case 'basic':
            users = users.filter((user: User) => (user.role === 'basic' && user.id === req.user.id))
    }
    // console.log(users)

    if(users) {
        logger.info("/api/users/getUser - Success")
        res.status(200).json(users);
    } else {
        res.status(400);
        logger.error("/api/users/getUser - User not found");
        throw new Error("User not found")
    }

    
})

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    let users = (await findAllUsers());
    // console.log(users)

    // Filtering results based on authorization
    if(users) {
        switch(req.user.role) {
            case 'admin':
                users = users.filter(user => (user.role === 'admin') || (user.role === 'basic'));
                break;
            case 'basic':
                users = users.filter(user => user.id === req.user.id)
        }
        logger.error("/api/users/getAllUsers - Success");
        res.status(200).json(users);
    }    
})

const postUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, role, email, password } = req.body;

    if(!name || !email || !role || !password) {
        res.status(400);
        logger.error("/api/users/postUser - Please enter all the fields.");
        throw new Error("Please enter all the fields.")
    }

    if(!(role === 'basic' || role === 'admin')) {
        res.status(400);
        logger.error("/api/users/postUser - Invalid role.");
        throw new Error("Invalid role.")
    }

    // Checking authorization
    switch(req.user.role) {
        case 'super-admin':
            if(role === 'super-admin') {
                res.status(400);
                logger.error("/api/users/postUser - There can only be 1 Super admin account");
                throw new Error("There can only be 1 Super admin account");
            }
            break;
        case 'admin':
            if(role !== 'basic') {
                res.status(400);
                logger.error("/api/users/postUser - Admins can only create Basic user accounts");
                throw new Error("Admins can only create Basic user accounts")
            };
            break;
        case 'basic':
            res.status(400);
            logger.error("/api/users/postUser - Action not allowed");
            throw new Error("Action not allowed")
            
    }

    // Check if user exists
    const userExists = (await findUsersByColumn("EMAIL", email))[0];

    if(userExists) {
        res.status(400);
        logger.error("/api/users/postUser - User already exists.");
        throw new Error("User already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await createUser(name, role, email, hashedPassword);

    if(user) {
        logger.info("/api/users/postUser - Created");
        res.status(201).json({
            message: `${user} row(s) updated`,
            token: generateToken(user.id)
        })
    } else {
        res.status(400)
        logger.error("/api/users/postUser - User Invalid data");
        throw new Error("User Invalid data")
    }    
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    let user = await findUsersByColumn("email", email);
    // console.log(user, email, password);
    user = user[0]

    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email, 
            token: generateToken(user.id)
        })
    } else {
        res.status(400);
        logger.error("/api/users/loginUser - Invalid Credentials");
        throw new Error("Invalid Credentials");
    }    
})

const putUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, key, value } = req.body;

    if(!email || !key || !value) {
        res.status(400);
        logger.error("/api/users/putUser - Please enter data to update");
        throw new Error("Please enter data to update")
    }

    if(key === 'role' || key === 'password' || key === 'id') {
        res.status(400);
        logger.error("/api/users/putUser - This change not allowed, only name and email can be changed.");
        throw new Error("This change not allowed, only name and email can be changed.");
    }

    if(key === 'email') {
        const checkUser = await findUsersByColumn("EMAIL", value);
        if(checkUser) {
            res.status(400);
            logger.error("/api/users/putUser - User with this email already exists");
            throw new Error("User with this email already exists");
        }
    }

    // Check if user exists
    const user = (await findUsersByColumn("EMAIL", email))[0];

    if(user) {
        // Checking authorization
        switch(req.user.role) {
            
            case 'admin':
                // console.log(user, req.user.email)
                if(user.role === 'super-admin')  {
                    res.status(400);
                    logger.error("/api/users/putUser - Cannot update super-admin account");
                    throw new Error("Cannot update super-admin account")
                } else if((user.role === 'admin' && user.id === req.user.id) || user.role === 'basic') {
                    break;
                } else {
                    res.status(400);
                    logger.error("/api/users/putUser - Cannot update other admin accounts");
                    throw new Error("Cannot update other admin accounts")
                }
                break;
            case 'basic':
                res.status(400);
                logger.error("/api/users/putUser - Action not allowed");
                throw new Error("Action not allowed")
                
        }
        const updatedUser = await updateUser(email, key, value);
        logger.info("/api/users/putUser - Updated user");
        res.status(200).json(updatedUser);
    } else {
        res.status(400);
        logger.error("/api/users/putUser - User does not exist");
        throw new Error("User does not exist");
    }

    
})

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Check if user exists
    const user = await findUsersByColumn("EMAIL", email);

    if(user) {
        // Checking authorization
        switch(req.user.role) {
            case 'super-admin':
                if(user.role === 'super-admin') {
                    res.status(400);
                    logger.error("/api/users/deleteUser - Super admin cannot delete himself");
                    throw new Error("Super admin cannot delete himself")
                }
                break;
            case 'admin':
                if(user.role !== 'basic') {
                    res.status(400);
                    logger.error("/api/users/deleteUser - Cannot delete non-basic accounts.");
                    throw new Error("Cannot delete non-basic accounts.")
                }
                break;
            case 'basic':
                res.status(400);
                logger.error("/api/users/deleteUser - Action not allowed");
                throw new Error("Action not allowed")
                
        }
        const deletedUser = await removeUser(email);
        logger.error("/api/users/deleteUser - Deleted");
        res.status(200).json(deletedUser)
    } else {
        res.status(400);
        logger.error("/api/users/deleteUser - User does not exist");
        throw new Error("User does not exist");
    }
})

const generateToken = (id: number) => {
    return userJwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

module.exports = {
    getUser,
    getAllUsers,
    postUser,
    loginUser,
    putUser,
    deleteUser
};