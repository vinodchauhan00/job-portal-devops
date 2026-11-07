const express = require('express');
const router = express.Router();
const {
  postJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  toggleApproveJob,
  getAllJobsAdmin
} = require('../Controllers/JobController');

const isAuthenticated = require('../Middleware/isAuthenticated');
const isAuthorized = require('../Middleware/isAuthorized');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Recruiter routes
router.post(
  '/post',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  postJob
);

router.get(
  '/recruiter/myjobs',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  getMyJobs
);

router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  updateJob
);

router.delete(
  '/:id',
  isAuthenticated,
  isAuthorized('recruiter', 'admin', 'user'),
  deleteJob
);

// Admin routes
router.get(
  '/admin/all',
  isAuthenticated,
  isAuthorized('admin'),
  getAllJobsAdmin
);

router.put(
  '/admin/approve/:id',
  isAuthenticated,
  isAuthorized('admin'),
  toggleApproveJob
);

module.exports = router;
