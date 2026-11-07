import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, User, FileText, Mail } from 'lucide-react';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true,
});
API.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = 'Bearer ' + t;
  return c;
});

const statusOptions = ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'];
const statusColors = {
  applied: 'bg-blue-50 text-blue-600',
  reviewing: 'bg-yellow-50 text-yellow-600',
  shortlisted: 'bg-purple-50 text-purple-600',
  rejected: 'bg-red-50 text-red-600',
  hired: 'bg-green-50 text-green-600'
};

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => { fetchApplicants(); }, [id]);

  const fetchApplicants = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        API.get(`/application/job/${id}`),
        API.get(`/job/${id}`)
      ]);
      setApplications(appRes.data.applications || []);
      setJobTitle(jobRes.data.job?.title || '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await API.put(`/application/status/${appId}`, { status });
      toast.success('Status updated to ' + status);
      setApplications((prev) =>
        prev.map((app) => app._id === appId ? { ...app, status } : app)
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition font-medium">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Applicants</h1>
          {jobTitle && <p className="text-gray-500 mt-1">Job: {jobTitle}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Total: {applications.length} applicant{applications.length !== 1 ? 's' : ''}</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <User size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No applicants yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app) => (
                <div key={app._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-lg">
                          {app.applicant?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{app.applicant?.name || 'Unknown'}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Mail size={13} /> {app.applicant?.email}
                        </div>
                        {app.applicant?.profile?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {app.applicant.profile.skills.slice(0, 4).map((skill, i) => (
                              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{skill}</span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                        {app.status}
                      </span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {app.applicant?.profile?.resume ? (
                        <a href={`${import.meta.env.VITE_UPLOADS_BASE_URL}/user/${app.applicant.profile.resume}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                          <FileText size={13} /> View Resume
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No resume</span>
                      )}
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

export default Applicants;