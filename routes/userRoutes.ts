const userExpress = require('express');
const userRouter = userExpress.Router();

const { loginUser, postUser, getUser, getAllUsers, putUser, deleteUser } = require('../controllers/userController');

// Enable route protection using JWT authentication
const { userProtect } = require('../middleware/authMiddleware');

// Add router routes for CRUD operations on users. 
userRouter.get('/get-users', userProtect, getAllUsers);
userRouter.get('/get-user', userProtect, getUser);
userRouter.post('/add-user', userProtect, postUser);
userRouter.post('/login-user', loginUser);
userRouter.put('/update-user', userProtect, putUser);
userRouter.delete('/delete-user', userProtect, deleteUser);

module.exports = userRouter;
