const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, verifyUser, getAllUsers, deleteUser } = require('../controllers/authController');

// Route for user registration
router.post('/register', registerUser);

// Route for verify user
router.post('/verifyuser', verifyUser);

// Route for user login
router.post('/login', loginUser);

// Logout route
router.post('/logout', logoutUser);

// Get Users
router.get('/users', getAllUsers);

// Get Users
router.delete('/users/:id', deleteUser);

module.exports = router;
