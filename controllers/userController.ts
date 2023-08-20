const userJwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

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
        res.status(200).json(users);
    } else {
        res.status(400);
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
        res.status(200).json(users);
    }    
})

const postUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, role, email, password } = req.body;

    if(!name || !email || !role || !password) {
        res.status(400);
        throw new Error("Please enter all the fields.")
    }

    if(!(role === 'basic' || role === 'admin')) {
        res.status(400);
        throw new Error("Invalid role.")
    }

    // Checking authorization
    switch(req.user.role) {
        case 'super-admin':
            if(role === 'super-admin') {
                res.status(400);
                throw new Error("There can only be 1 Super admin account");
            }
            break;
        case 'admin':
            if(role !== 'basic') {
                res.status(400);
                throw new Error("Admins can only create Basic user accounts")
            };
            break;
        case 'basic':
            res.status(400);
            throw new Error("Action not allowed")
            
    }

    // Check if user exists
    const userExists = (await findUsersByColumn("EMAIL", email))[0];

    if(userExists) {
        res.status(400);
        throw new Error("User already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await createUser(name, role, email, hashedPassword);

    if(user) {
        res.status(201).json({
            message: `${user} row(s) updated`,
            token: generateToken(user.id)
        })
    } else {
        res.status(400)
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
        throw new Error("Invalid Credentials");
    }    
})

const putUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, key, value } = req.body;

    if(!email || !key || !value) {
        res.status(400);
        throw new Error("Please enter data to update")
    }

    if(key === 'role' || key === 'password' || key === 'id') {
        res.status(400);
        throw new Error("This change not allowed, only name and email can be changed.");
    }

    if(key === 'email') {
        const checkUser = await findUsersByColumn("EMAIL", value);
        if(checkUser) {
            res.status(400);
            throw new Error("User with this email already exists");
        }
    }

    // Check if user exists
    const user = await findUsersByColumn("EMAIL", email);

    if(user) {
        // Checking authorization
        switch(req.user.role) {
            case 'super-admin':
                break;
            case 'admin':
                if(user.role !== 'basic' && user.email === req.user.email)  {
                    res.status(400);
                    throw new Error("Cannot update non-basic or other admin accounts.")
                }
                break;
            case 'basic':
                res.status(400);
                throw new Error("Action not allowed")
                
        }
        const updatedUser = await updateUser(email, key, value);
        res.status(200).json(updatedUser);
    } else {
        res.status(400);
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
                break;
            case 'admin':
                if(user.role !== 'basic') {
                    res.status(400);
                    throw new Error("Cannot delete non-basic accounts.")
                }
                break;
            case 'basic':
                res.status(400);
                throw new Error("Action not allowed")
                
        }
        const deletedUser = await removeUser(email);
        res.status(200).json(deletedUser)
    } else {
        res.status(400);
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