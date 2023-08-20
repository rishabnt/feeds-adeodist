const userExpress = require('express');
const userRouter = userExpress.Router();

const { postUser, getUser, putUser, deleteUser } = require('../controllers/userController');

// Enable route protection using JWT authentication
const { userProtect } = require('../middleware/authMiddleware');

// Add router routes for CRUD operations on users. 
userRouter.get('/getUsers', userProtect, getUser);
userRouter.post('/addUser', userProtect, postUser);
userRouter.put('/updateUser', userProtect, putUser);
userRouter.delete('/deleteUser', userProtect, deleteUser);

module.exports = userRouter;
