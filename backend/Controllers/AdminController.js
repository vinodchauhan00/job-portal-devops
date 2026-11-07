const { User, Job, Application, Company } = require('../Models');

// GET DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApprovedJobs = await Job.countDocuments({ isApproved: true });
    const totalPendingJobs = await Job.countDocuments({ isApproved: false });
    const totalApplications = await Application.countDocuments();
    const totalCompanies = await Company.countDocuments();

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Jobs by type
    const jobsByType = await Job.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Monthly jobs posted (last 6 months)
    const monthlyJobs = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Monthly applications (last 6 months)
    const monthlyApplications = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top companies by jobs posted
    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$company',
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          'company.name': 1,
          'company.logo': 1,
          jobCount: 1
        }
      }
    ]);

    // Recent users (last 5)
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent jobs (last 5)
    const recentJobs = await Job.find()
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent applications (last 5)
    const recentApplications = await Application.find()
      .populate('applicant', 'name email')
      .populate({
        path: 'job',
        select: 'title',
        populate: { path: 'company', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRecruiters,
        totalJobs,
        totalApprovedJobs,
        totalPendingJobs,
        totalApplications,
        totalCompanies
      },
      charts: {
        applicationsByStatus,
        jobsByType,
        monthlyUsers,
        monthlyJobs,
        monthlyApplications
      },
      topCompanies,
      recent: {
        recentUsers,
        recentJobs,
        recentApplications
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ALL USERS WITH FILTERS
const getAllUsers = async (req, res) => {
  try {
    const { role, isBlocked, search } = req.query;

    const query = {};

    if (role) query.role = role;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

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

// BLOCK / UNBLOCK USER
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin user'
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

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin user'
      });
    }

    // Delete all applications by this user
    await Application.deleteMany({ applicant: req.params.id });

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

// APPROVE / REJECT JOB
const toggleApproveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.isApproved = !job.isApproved;
    await job.save();

    return res.status(200).json({
      success: true,
      message: job.isApproved ? 'Job approved' : 'Job rejected',
      isApproved: job.isApproved
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// DELETE JOB
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await Application.deleteMany({ job: req.params.id });
    await Job.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ALL COMPANIES
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

    // Delete all jobs of this company
    const jobs = await Job.find({ company: req.params.id });
    for (const job of jobs) {
      await Application.deleteMany({ job: job._id });
    }
    await Job.deleteMany({ company: req.params.id });
    await Company.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Company and all related data deleted'
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
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  toggleApproveJob,
  deleteJob,
  getAllCompanies,
  deleteCompany
};