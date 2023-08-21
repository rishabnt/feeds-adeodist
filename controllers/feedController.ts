const asyncHandler = require('express-async-handler');
const { logger } = require('../logger');

import { Feed } from '../interface/feed.interface';
import { Request, Response, NextFunction } from 'express';
const { findAllFeeds, findFeedsByColumn, createFeed, updateFeed, removeFeed } = require('../config/db');

// @desc Register new user
// @route POST /addUser
// @access Public
const getFeed = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.body;

    if(!id) {
        res.status(400);
        logger.error("/api/feeds/getFeed - Please enter required parameters")
        throw new Error("Please enter required parameters")
    }

    let feeds = await findFeedsByColumn("ID", id);
    console.log(req.user)

    if(feeds) {
        // Filtering results based on role
        switch(req.user.role) {
            case 'admin':
                feeds = feeds.filter((feed: Feed) => (feed.can_access === 'admin' || feed.can_access === 'basic'))
                break;
            case 'basic':
                feeds = feeds.filter((feed: Feed) => feed.can_access === 'basic')
                
        }
        
        logger.info("/api/feeds/getFeed - Success")
        res.status(200).json(feeds);
    } else {
        res.status(400);
        logger.error("/api/feeds/getFeed - Please enter required parameters")
        throw new Error("Please enter required parameters")
    }
})

const getAllFeeds = asyncHandler(async (req: Request, res: Response) => {
    let feeds = await findAllFeeds();
    console.log(req.user);
    if(feeds){
        // Filtering results based on role
        switch(req.user.role) {
            case 'admin':
                feeds = feeds.filter((feed: Feed) => (feed.can_access === 'admin' || feed.can_access === 'basic'))
                break;
            case 'basic':
                feeds = feeds.filter((feed: Feed) => feed.can_access === 'basic')
                
        }
        logger.info("/api/feeds/getAllFeeds - Success");
        res.status(200).json(feeds);   
    } 
})

const postFeed = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, can_access, can_delete } = req.body;

    if(!name || !description) {
        res.status(400);
        logger.error("/api/feeds/postFeed - Please enter all the fields.");
        throw new Error("Please enter all the fields.")
    }

    // check if role names are valid
    if(!['super-admin', 'admin', 'basic'].includes(can_access) || !['super-admin', 'admin', 'basic'].includes(can_delete)) {
        res.status(400);
        logger.error("/api/feeds/postFeed - Please specify valid role names.");
        throw new Error("Please specify valid role names.")
    }

    // Authorization
    switch(req.user.role) {
        case 'admin':
            if(can_access === 'super-admin' || can_delete === 'basic') {
                res.status(400)
                logger.error("/api/feeds/postFeed - Invalid access.");
                throw new Error("Invalid access");
            }
            break;
        case 'basic':
            res.status(400)
            logger.error("/api/feeds/postFeed - Invalid action.");
            throw new Error("Invalid action")
            
    }

    const url = Math.floor(Math.random() * 10000);

    const feed = await createFeed(name, url, description, can_access, can_delete);

    if(feed) {
        logger.info(req.user.id + req.user.name + ": Created new Feed - " + name);
        res.status(201).json({
            rowCount: feed.rowCount
        })
    } else {
        res.status(400)
        logger.error("/api/feeds/postFeed - Feed invalid data");
        throw new Error("Feed Invalid data")
    }    
})

const putFeed = asyncHandler(async (req: Request, res: Response) => {
    const { id, key, value } = req.body;

    if(!id || !key || !value) {
        res.status(400);
        logger.error("/api/feeds/putFeed - Please enter data to update");
        throw new Error("Please enter data to update")
    }

    // Check if feed exists
    const feed = await findFeedsByColumn("ID", id);

    if(feed) {
        // Authorization
        switch(req.user.role) {
            case 'admin':
                if(feed.can_access === 'super-admin') {
                    res.status(400)
                    logger.error("/api/feeds/putFeed - You don't have access to this feed.");
                    throw new Error("You don't have access to this feed.");
                }
                break;
            case 'basic':
                res.status(400)
                logger.error("/api/feeds/putFeed - Invalid action");
                throw new Error("Invalid action")
                
        }
        const updatedUser = await updateFeed(id, key, value);
        logger.info("/api/feeds/putFeed - Updated row count - ' + updatedUser.rowCount");
        res.status(200).json('Updated row count - ' + updatedUser.rowCount)
    } else {
        res.status(400);
        logger.error("/api/feeds/putFeed - Feed does not exist");
        throw new Error("Feed does not exist");
    }

    
})

const deleteFeed = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.body;

    // Check if feed exists
    const feed = await findFeedsByColumn("ID", id);

    if(feed) {
        switch(req.user.role) {
            case 'admin':
                if(feed.can_access === 'super-admin' || feed.can_delete === 'super-admin') {
                    res.status(400)
                    logger.error("/api/feeds/deleteFeed - You don't have access to this feed.");
                    throw new Error("You don't have access to this feed.");
                }
                break;
            case 'basic':
                res.status(400)
                logger.error("/api/feeds/deleteFeed - Invalid action");
                throw new Error("Invalid action")
                
        }
        const deletedFeed = await removeFeed(id);
        logger.info('Deleted row count - ' + deletedFeed.rowCount);
        res.status(200).json('Deleted row count - ' + deletedFeed.rowCount);
    } else {
        res.status(400);
        logger.error("/api/feeds/deleteFeed - Feed does not exist");
        throw new Error("Feed does not exist");
    }
})

module.exports = {
    getFeed,
    getAllFeeds,
    postFeed,
    putFeed,
    deleteFeed
};