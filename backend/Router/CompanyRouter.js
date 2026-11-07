const express = require('express');
const router = express.Router();
const {
  registerCompany,
  getMyCompanies,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany
} = require('../Controllers/CompanyController');

const isAuthenticated = require('../Middleware/isAuthenticated');
const isAuthorized = require('../Middleware/isAuthorized');
const upload = require('../Utils/multer');

// Recruiter routes
router.post(
  '/register',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  upload.single('logo'),
  registerCompany
);

router.get(
  '/my',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  getMyCompanies
);

router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('recruiter', 'admin'),
  upload.single('logo'),
  updateCompany
);

router.delete(
  '/:id',
  isAuthenticated,
  deleteCompany
);

// Public route
router.get('/:id', getCompanyById);

// Admin route
router.get(
  '/',
  isAuthenticated,
  isAuthorized('admin'),
  getAllCompanies
);

module.exports = router;