const { Company } = require('../Models');
const path = require('path');
const fs = require('fs');

// REGISTER COMPANY
const registerCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Check if company already exists with same recruiter
    const existing = await Company.findOne({ name, userId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already registered a company with this name'
      });
    }

    let logoPath = '';
    if (req.file) {
      logoPath = 'Uploads/' + req.file.filename;
    }

    const company = await Company.create({
      name,
      description,
      website,
      location,
      logo: logoPath,
      userId: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      company
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET MY COMPANIES (recruiter)
const getMyCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET SINGLE COMPANY
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      company
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ALL COMPANIES (admin)
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// UPDATE COMPANY
const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Only owner can update
    if (company.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    const updateData = { name, description, website, location };

    // Logo update
    if (req.file) {
      // Delete old logo
      if (company.logo) {
        const oldPath = path.join(__dirname, '..', company.logo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.logo = 'Uploads/' + req.file.filename;
    }

    const updated = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// DELETE COMPANY
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Only owner or admin can delete
    if (
      company.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this company'
      });
    }

    // Delete logo file
    if (company.logo) {
      const logoPath = path.join(__dirname, '..', company.logo);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }

    await Company.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  registerCompany,
  getMyCompanies,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany
};