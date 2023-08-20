const feedExpress = require('express');
const feedRouter = feedExpress.Router();

const { getFeeds, postFeed, putFeed, deleteFeed } = require('../controllers/feedController');

const { feedProtect } = require('../middleware/authMiddleware');

// Routes requests for same route to multiple Controllers for different request types. 
feedRouter.route('/').get(feedProtect, getFeeds).post(feedProtect, postFeed);
feedRouter.route('/:id').post(feedProtect, putFeed).delete(feedProtect, deleteFeed);

module.exports = feedRouter;