const { User } = require('../Models');
const path = require('path');
const fs = require('fs');

// GET MY PROFILE
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, experience, education } = req.body;

    const updateData = {
      name,
      'profile.bio': bio,
      'profile.experience': experience,
      'profile.education': education,
    };

    // Skills — comma separated string to array
    if (skills) {
      updateData['profile.skills'] = skills.split(',').map(s => s.trim());
    }

    // Resume upload
    if (req.files && req.files.resume) {
      const resume = req.files.resume[0];

      // Delete old resume if exists
      const existingUser = await User.findById(req.user._id);
      if (existingUser.profile.resume) {
        const oldPath = path.join(__dirname, '..', existingUser.profile.resume);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      updateData['profile.resume'] = 'Uploads/' + resume.filename;
      updateData['profile.resumeOriginalName'] = resume.originalname;
    }

    // Profile photo upload
    if (req.files && req.files.profilePhoto) {
      const photo = req.files.profilePhoto[0];

      // Delete old photo if exists
      const existingUser = await User.findById(req.user._id);
      if (existingUser.profile.profilePhoto) {
        const oldPath = path.join(__dirname, '..', existingUser.profile.profilePhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      updateData['profile.profilePhoto'] = 'Uploads/' + photo.filename;
    }

    // ✅ FIXED: returnDocument: 'after' instead of new: true
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { returnDocument: 'after' }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ANY USER PROFILE (public)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ALL USERS (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// BLOCK / UNBLOCK USER (admin only)
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      isBlocked: user.isBlocked
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// DELETE USER (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete resume file if exists
    if (user.profile.resume) {
      const filePath = path.join(__dirname, '..', user.profile.resume);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
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
  getMyProfile,
  updateProfile,
  getUserProfile,
  getAllUsers,
  toggleBlockUser,
  deleteUser
};