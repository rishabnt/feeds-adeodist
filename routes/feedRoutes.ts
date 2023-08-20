const feedExpress = require('express');
const feedRouter = feedExpress.Router();

const { getFeed, getAllFeeds, postFeed, putFeed, deleteFeed } = require('../controllers/feedController');

const { feedProtect } = require('../middleware/authMiddleware');

// Routes requests for same route to multiple Controllers for different request types. 
feedRouter.get('/get-feeds', feedProtect, getAllFeeds);
feedRouter.get('/get-feed', feedProtect, getFeed);
feedRouter.post('/add-feed', feedProtect, postFeed);
feedRouter.put('/update-feed', feedProtect, putFeed);
feedRouter.delete('/delete-feed', feedProtect, deleteFeed);

module.exports = feedRouter;