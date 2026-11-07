import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Briefcase, Clock, CheckCircle, XCircle,
  User, FileText, Star, Eye
} from 'lucide-react';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
API.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = 'Bearer ' + t;
  return c;
});

const statusColors = {
  applied: 'bg-blue-50 text-blue-600',
  reviewing: 'bg-yellow-50 text-yellow-600',
  shortlisted: 'bg-purple-50 text-purple-600',
  rejected: 'bg-red-50 text-red-600',
  hired: 'bg-green-50 text-green-600'
};

const statusIcons = {
  applied: <Clock size={14} />,
  reviewing: <Eye size={14} />,
  shortlisted: <Star size={14} />,
  rejected: <XCircle size={14} />,
  hired: <CheckCircle size={14} />
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get('/application/my');
      setApplications(res.data.applications || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await API.delete(`/application/withdraw/${appId}`);
      toast.success('Application withdrawn');
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw');
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    hired: applications.filter((a) => a.status === 'hired').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <User size={18} /> My Profile
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: stats.total, icon: <Briefcase size={22} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Pending', value: stats.applied, icon: <Clock size={22} />, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: <Star size={22} />, color: 'text-purple-600 bg-purple-50' },
            { label: 'Hired', value: stats.hired, icon: <CheckCircle size={22} />, color: 'text-green-600 bg-green-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Resume Warning */}
        {!user?.profile?.resume && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="text-yellow-600" size={22} />
              <div>
                <p className="font-semibold text-yellow-800">Resume not uploaded!</p>
                <p className="text-yellow-600 text-sm">Upload your resume to apply for jobs</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition text-sm"
            >
              Upload Now
            </button>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">My Applications</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No applications yet</p>
              <p className="text-sm mt-1">Start applying for jobs!</p>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app) => (
                <div key={app._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {app.job?.company?.logo ? (
                        <img
                          src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${app.job.company.logo}`}
                          alt={app.job?.company?.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="text-blue-600" size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800">{app.job?.title || 'Job Deleted'}</h3>
                        <p className="text-gray-500 text-sm">{app.job?.company?.name || '—'}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusIcons[app.status]}
                        {app.status}
                      </span>
                      <div className="flex gap-2">
                        {app.job?._id && (
                          <button
                            onClick={() => navigate(`/jobs/${app.job._id}`)}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            View Job
                          </button>
                        )}
                        {app.status === 'applied' && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            className="text-xs text-red-500 hover:underline font-medium"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
