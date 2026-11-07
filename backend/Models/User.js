const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'user'
  },
  profile: {
    bio: { type: String, default: '' },
    skills: [String],
    experience: { type: String, default: '' },
    education: { type: String, default: '' },
    resume: { type: String, default: '' },
    resumeOriginalName: { type: String, default: '' },
    profilePhoto: { type: String, default: '' }
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);