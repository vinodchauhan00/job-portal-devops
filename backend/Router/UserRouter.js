const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  getUserProfile,
  getAllUsers,
  toggleBlockUser,
  deleteUser
} = require('../Controllers/UserController');

const isAuthenticated = require('../Middleware/isAuthenticated');
const isAuthorized = require('../Middleware/isAuthorized');
const upload = require('../Utils/multer');

// My profile
router.get('/me', isAuthenticated, getMyProfile);

// Update profile with file upload
router.put(
  '/update',
  isAuthenticated,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 }
  ]),
  updateProfile
);

// Public profile
router.get('/:id', getUserProfile);

// Admin routes
router.get('/', isAuthenticated, isAuthorized('admin'), getAllUsers);
router.put('/block/:id', isAuthenticated, isAuthorized('admin'), toggleBlockUser);
router.delete('/:id', isAuthenticated, isAuthorized('admin'), deleteUser);

module.exports = router;