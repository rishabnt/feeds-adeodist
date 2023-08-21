const logExpress = require('express');
const logRouter = logExpress.Router();

const { getLogs } = require('../controllers/logController');

const { logProtect } = require('../middleware/authMiddleware');

logRouter.get('/get-logs', logProtect, getLogs);

module.exports = logRouter;