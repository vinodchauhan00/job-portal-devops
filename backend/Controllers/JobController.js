const { Job, Company, Application } = require('../Models');

// POST JOB (recruiter)
const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId
    } = req.body;

    if (!title || !description || !location || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, location and company are required'
      });
    }

    // Check company belongs to recruiter
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (company.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This company does not belong to you'
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements
        ? requirements.split(',').map(r => r.trim())
        : [],
      salary: Number(salary) || 0,
      location,
      jobType: jobType || 'Full-time',
      experience: experience || '0',
      position: Number(position) || 1,
      company: companyId,
      createdBy: req.user._id,
      isApproved: false
    });

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully. Waiting for admin approval.',
      job
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ALL APPROVED JOBS (public + search + filter)
const getAllJobs = async (req, res) => {
  try {
    const {
      keyword,
      location,
      jobType,
      salary,
      experience,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isApproved: true };

    // Keyword search in title or description
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { requirements: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (salary) {
      query.salary = { $gte: Number(salary) };
    }

    if (experience) {
      query.experience = experience;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('company')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      jobs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET SINGLE JOB
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('createdBy', 'name email')
      .populate({
        path: 'applications',
        populate: {
          path: 'applicant',
          select: 'name email profile'
        }
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      job
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET RECRUITER'S OWN JOBS
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .populate('company')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// UPDATE JOB (recruiter)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position
    } = req.body;

    const updateData = {
      title,
      description,
      salary: Number(salary),
      location,
      jobType,
      experience,
      position: Number(position),
      isApproved: false // re-approval after edit
    };

    if (requirements) {
      updateData.requirements = requirements.split(',').map(r => r.trim());
    }

    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('company');

    return res.status(200).json({
      success: true,
      message: 'Job updated. Waiting for admin approval again.',
      job: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// DELETE JOB (recruiter or admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete all applications for this job
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

// APPROVE / REJECT JOB (admin only)
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

// GET ALL JOBS FOR ADMIN (approved + pending)
const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('company')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
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
  postJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  toggleApproveJob,
  getAllJobsAdmin
};