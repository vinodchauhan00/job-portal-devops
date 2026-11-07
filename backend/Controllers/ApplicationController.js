const { Application, Job } = require('../Models');

// APPLY FOR JOB (user)
const applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    // Check job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check job is approved
    if (!job.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'This job is not available'
      });
    }

    // Check already applied
    const existing = await Application.findOne({
      job: jobId,
      applicant: userId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Check resume exists
    if (!req.user.profile.resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume before applying'
      });
    }

    const application = await Application.create({
      job: jobId,
      applicant: userId,
      status: 'applied'
    });

    // Add application reference to job
    job.applications.push(application._id);
    await job.save();

    return res.status(201).json({
      success: true,
      message: 'Applied successfully',
      application
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET MY APPLICATIONS (user — track status)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user._id
    })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo location'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET APPLICANTS FOR A JOB (recruiter)
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only job owner can see applicants
    if (job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('applicant', 'name email profile')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// UPDATE APPLICATION STATUS (recruiter)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'applied',
      'reviewing',
      'shortlisted',
      'rejected',
      'hired'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only job owner or admin can update status
    if (
      application.job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET ALL APPLICATIONS (admin)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('applicant', 'name email')
      .populate({
        path: 'job',
        select: 'title location',
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// WITHDRAW APPLICATION (user)
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only applicant can withdraw
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Can only withdraw if still in applied stage
    if (application.status !== 'applied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application at this stage'
      });
    }

    // Remove from job applications array
    await Job.findByIdAndUpdate(application.job, {
      $pull: { applications: application._id }
    });

    await Application.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
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
  applyJob,
  getMyApplications,
  getJobApplicants,
  updateStatus,
  getAllApplications,
  withdrawApplication
};