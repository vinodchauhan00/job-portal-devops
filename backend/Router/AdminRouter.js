const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  toggleApproveJob,
  deleteJob,
  getAllCompanies,
  deleteCompany
} = require('../Controllers/AdminController');

const isAuthenticated = require('../Middleware/isAuthenticated');
const isAuthorized = require('../Middleware/isAuthorized');

// All admin routes protected
router.use(isAuthenticated, isAuthorized('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/block/:id', toggleBlockUser);
router.delete('/users/:id', deleteUser);

// Job management
router.put('/jobs/approve/:id', toggleApproveJob);
router.delete('/jobs/:id', deleteJob);

// Company management
router.get('/companies', getAllCompanies);
router.delete('/companies/:id', deleteCompany);

module.exports = router;