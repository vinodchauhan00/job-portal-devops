import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/axios';
import toast from 'react-hot-toast';
import { Briefcase, Plus, Users, Edit, Trash2, CheckCircle, Clock, Building2 } from 'lucide-react';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await API.get('/job/recruiter/myjobs');
      setJobs(res.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await API.delete(`/job/${jobId}`);
      toast.success('Job deleted');
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const stats = {
    total: jobs.length,
    approved: jobs.filter((j) => j.isApproved).length,
    pending: jobs.filter((j) => !j.isApproved).length,
    applications: jobs.reduce((acc, j) => acc + (j.applications?.length || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Recruiter Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your job postings</p>
          </div>
          <button
            onClick={() => navigate('/recruiter/post-job')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} /> Post Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: stats.total, icon: <Briefcase size={22} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Approved', value: stats.approved, icon: <CheckCircle size={22} />, color: 'text-green-600 bg-green-50' },
            { label: 'Pending', value: stats.pending, icon: <Clock size={22} />, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Applications', value: stats.applications, icon: <Users size={22} />, color: 'text-purple-600 bg-purple-50' }
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

        {/* Jobs List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">My Jobs</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No jobs posted yet</p>
              <button
                onClick={() => navigate('/recruiter/post-job')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Post First Job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <div key={job._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {job.company?.logo ? (
                        <img
                          src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${job.company.logo}`}
                          alt={job.company?.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="text-blue-600" size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800">{job.title}</h3>
                        <p className="text-gray-500 text-sm">{job.company?.name}</p>
                        <p className="text-gray-400 text-xs mt-1">{job.location} • {job.jobType}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.isApproved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {job.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      <p className="text-gray-400 text-xs">
                        {job.applications?.length || 0} applicants
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/recruiter/applicants/${job._id}`)}
                          className="flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium"
                        >
                          <Users size={13} /> Applicants
                        </button>
                        <button
                          onClick={() => navigate(`/recruiter/edit-job/${job._id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:underline font-medium"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
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

export default RecruiterDashboard;