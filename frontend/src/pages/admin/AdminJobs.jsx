import { useEffect, useState } from "react";
import axios from "../../utils/axios";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      // Your backend: GET /api/v1/job/admin/all
      const { data } = await axios.get("/job/admin/all");
      setJobs(data.jobs);
    } catch { } finally { setLoading(false); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Your backend toggles isApproved, route: PUT /admin/jobs/approve/:id
  const handleApproveToggle = async (jobId, isApproved) => {
    try {
      const { data } = await axios.put(`/admin/jobs/approve/${jobId}`);
      setJobs((prev) =>
        prev.map((j) => j._id === jobId ? { ...j, isApproved: data.isApproved } : j)
      );
      showToast(data.message);
    } catch (err) {
      showToast(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job? All applications for it will also be deleted.")) return;
    try {
      await axios.delete(`/admin/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      showToast("Job deleted successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Error");
    }
  };

  const filtered =
    filter === "all"
      ? jobs
      : filter === "approved"
      ? jobs.filter((j) => j.isApproved)
      : jobs.filter((j) => !j.isApproved);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">All Jobs</h2>
        <span className="text-sm text-gray-500">{filtered.length} of {jobs.length}</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: `All (${jobs.length})` },
          { key: "pending", label: `Pending (${jobs.filter((j) => !j.isApproved).length})` },
          { key: "approved", label: `Approved (${jobs.filter((j) => j.isApproved).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Job Title</th>
              <th className="px-6 py-3 text-left">Company</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Location</th>
              <th className="px-6 py-3 text-left">Salary</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((job) => (
              <tr key={job._id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <p className="font-medium text-gray-800">{job.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-6 py-3 text-gray-600">{job.company?.name || "—"}</td>
                <td className="px-6 py-3 text-gray-600">{job.jobType}</td>
                <td className="px-6 py-3 text-gray-600">{job.location}</td>
                <td className="px-6 py-3 text-gray-600">
                  {job.salary ? `₹${job.salary.toLocaleString()}` : "—"}
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    job.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {job.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveToggle(job._id, job.isApproved)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        job.isApproved
                          ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {job.isApproved ? "Revoke" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminJobs;