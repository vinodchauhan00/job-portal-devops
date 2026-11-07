import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL, withCredentials: true });
API.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if(t) c.headers.Authorization = 'Bearer ' + t; return c; });
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Clock, Briefcase, Building2, Users, ArrowLeft, CheckCircle, DollarSign, Award } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await API.get(`/job/${id}`);
      setJob(res.data.job);
      if (user) {
        const appRes = await API.get('/application/my');
        const alreadyApplied = appRes.data.applications.some((app) => app.job?._id === id);
        setApplied(alreadyApplied);
      }
    } catch (error) {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      toast.error('Only job seekers can apply');
      return;
    }
    if (!user.profile?.resume) {
      toast.error('Please upload your resume first');
      navigate('/profile');
      return;
    }
    setApplying(true);
    try {
      const res = await API.post(`/application/apply/${id}`);
      toast.success(res.data.message);
      setApplied(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Apply failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition font-medium"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {job.company?.logo ? (
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/company/${job.company.logo}`}
                    alt={job.company?.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="text-blue-600" size={28} />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
                  <p className="text-blue-600 font-semibold mt-1">{job.company?.name}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin size={15} />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock size={15} />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Users size={15} />
                      {job.applications?.length || 0} applicants
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {job.jobType}
                </span>
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                  {job.experience} yrs exp
                </span>
                <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                  {job.position} positions
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Job Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          <div className="space-y-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              {job.salary > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="text-green-500" size={20} />
                  <span className="text-2xl font-bold text-gray-800">
                    Rs.{job.salary.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
              )}

              {user?.role === 'user' && (
                <button
                  onClick={handleApply}
                  disabled={applied || applying}
                  className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${applied ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {applied ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle size={20} />
                      Already Applied
                    </span>
                  ) : applying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Apply Now</span>
                  )}
                </button>
              )}

              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Login to Apply
                </button>
              )}

              {user?.role === 'recruiter' && (
                <div className="bg-yellow-50 text-yellow-700 p-3 rounded-xl text-sm text-center">
                  Recruiters cannot apply for jobs
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Job Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Briefcase size={17} className="text-blue-500" />
                    Job Type
                  </div>
                  <span className="text-gray-800 font-medium text-sm">{job.jobType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Award size={17} className="text-purple-500" />
                    Experience
                  </div>
                  <span className="text-gray-800 font-medium text-sm">{job.experience} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin size={17} className="text-red-500" />
                    Location
                  </div>
                  <span className="text-gray-800 font-medium text-sm">{job.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users size={17} className="text-green-500" />
                    Positions
                  </div>
                  <span className="text-gray-800 font-medium text-sm">{job.position}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">About Company</h3>
              {job.company?.logo && (
                <img
                  src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${job.company.logo}`}
                  alt={job.company?.name}
                  className="w-12 h-12 rounded-xl object-cover mb-3"
                />
              )}
              <p className="font-semibold text-gray-800">{job.company?.name}</p>
              {job.company?.description && (
                <p className="text-gray-500 text-sm mt-2 line-clamp-3">
                  {job.company.description}
                </p>
              )}
          {job.company?.website && (
  <a
    href={job.company.website}
    target="_blank"
    rel="noreferrer"
    className="text-blue-600 text-sm hover:underline mt-2 block"
  >
    Visit Website
  </a>
)}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;