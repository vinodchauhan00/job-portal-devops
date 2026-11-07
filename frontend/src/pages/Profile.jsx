import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import toast from 'react-hot-toast';
import { User, Upload, Briefcase, GraduationCap, Code, FileText, Loader2, Camera } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills?.join(', ') || '',
    experience: user?.profile?.experience || '',
    education: user?.profile?.education || ''
  });

  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      data.append('skills', formData.skills);
      data.append('experience', formData.experience);
      data.append('education', formData.education);
      if (resume) data.append('resume', resume);
      if (photo) data.append('profilePhoto', photo);

      const res = await API.put('/user/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Photo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Camera size={20} className="text-blue-600" />
              Profile Photo
            </h2>
            <div className="flex items-center gap-4">
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-600"
                />
              ) : user?.profile?.profilePhoto ? (
                <img
                  src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/user/${user.profile.profilePhoto}`}
                  alt="profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-600"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="text-blue-600" size={32} />
                </div>
              )}
              <div>
                <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition text-sm flex items-center gap-2">
                  <Upload size={16} />
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhoto(e.target.files[0])}
                  />
                </label>
                <p className="text-gray-400 text-xs mt-1">JPG, PNG max 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Basic Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Code size={20} className="text-blue-600" />
              Skills
            </h2>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, Python..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">Separate skills with commas</p>

            {formData.skills && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.split(',').map((skill, i) => (
                  skill.trim() && (
                    <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {skill.trim()}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Experience & Education */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Experience & Education
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows={3}
                  placeholder="2 years at XYZ Company as Frontend Developer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <GraduationCap size={16} />
                  Education
                </label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  rows={3}
                  placeholder="B.Tech Computer Science, XYZ University 2022..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Resume
            </h2>

            {user?.profile?.resume && !resume && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <FileText className="text-green-600" size={20} />
                <div>
                  <p className="text-green-700 font-medium text-sm">
                    {user.profile.resumeOriginalName || 'Resume uploaded'}
                  </p>
                  <a
                    href={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${user.profile.resume}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-600 text-xs hover:underline"
                  >
                    View current resume
                  </a>
                </div>
              </div>
            )}

            {resume && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
                <FileText className="text-blue-600" size={20} />
                <p className="text-blue-700 font-medium text-sm">{resume.name}</p>
              </div>
            )}

            <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition">
              <Upload className="text-gray-400" size={28} />
              <span className="text-gray-600 font-medium">Click to upload resume</span>
              <span className="text-gray-400 text-sm">PDF only, max 5MB</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;