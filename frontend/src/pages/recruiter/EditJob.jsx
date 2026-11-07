import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Briefcase, ArrowLeft, Loader2 } from 'lucide-react';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
API.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = 'Bearer ' + t;
  return c;
});

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: 'Full-time',
    experience: '',
    position: '',
    companyId: '',
  });

  // Fetch job data + companies on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, companyRes] = await Promise.all([
          API.get(`/job/${id}`),
          API.get('/company/my'),
        ]);

        const job = jobRes.data.job;
        setFormData({
          title: job.title || '',
          description: job.description || '',
          requirements: Array.isArray(job.requirements)
            ? job.requirements.join(', ')
            : job.requirements || '',
          salary: job.salary || '',
          location: job.location || '',
          jobType: job.jobType || 'Full-time',
          experience: job.experience || '',
          position: job.position || '',
          companyId: job.company?._id || job.company || '',
        });

        setCompanies(companyRes.data.companies || []);
      } catch (err) {
        toast.error('Failed to load job details');
        navigate('/recruiter/dashboard');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      toast.error('Please select a company');
      return;
    }
    setLoading(true);
    try {
      // Backend: PUT /api/v1/job/:id
      const res = await API.put(`/job/${id}`, formData);
      toast.success(res.data.message || 'Job updated successfully');
      navigate('/recruiter/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="text-blue-600" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Edit Job</h1>
              <p className="text-gray-500 text-sm">Update job details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Company Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Company
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose company...</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Frontend Developer"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the role, responsibilities..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <input
                type="text"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Salary + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary (per month)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Bangalore"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Job Type + Experience + Positions */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (yrs)
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="0-2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Positions
                </label>
                <input
                  type="number"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Updating...</>
              ) : (
                'Update Job'
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJob;