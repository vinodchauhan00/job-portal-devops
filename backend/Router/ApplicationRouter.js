const express = require('express');
const router = express.Router();
const {
  applyJob,
  getMyApplications,
  getJobApplicants,
  updateStatus,
  getAllApplications,
  withdrawApplication
} = require('../Controllers/ApplicationController');

const isAuthenticated = require('../Middleware/isAuthenticated');
const isAuthorized = require('../Middleware/isAuthorized');

// User routes
router.post(
  '/apply/:id',
  isAuthenticated,
  isAuthorized('user'),
  applyJob
);

router.get(
  '/my',
  isAuthenticated,
  isAuthorized('user'),
  getMyApplications
);

router.delete(
  '/withdraw/:id',
  isAuthenticated,
  isAuthorized('user'),
  withdrawApplication
);

// Recruiter routes
router.get(
  '/job/:id',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  getJobApplicants
);

router.put(
  '/status/:id',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  updateStatus
);

// Admin routes
router.get(
  '/all',
  isAuthenticated,
  isAuthorized('admin'),
  getAllApplications
);

module.exports = router;
