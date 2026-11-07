import { useEffect, useState } from "react";
import axios from "../../utils/axios";

const StatCard = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-3xl font-semibold ${color}`}>{value ?? "—"}</p>
  </div>
);

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return <p className="text-red-500 text-sm">{error}</p>;

  const { stats, recent, charts } = data;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} color="text-blue-600" />
        <StatCard label="Recruiters" value={stats.totalRecruiters} color="text-purple-600" />
        <StatCard label="Total Jobs" value={stats.totalJobs} color="text-green-600" />
        <StatCard label="Applications" value={stats.totalApplications} color="text-orange-500" />
        <StatCard label="Approved Jobs" value={stats.totalApprovedJobs} color="text-teal-600" />
        <StatCard label="Pending Jobs" value={stats.totalPendingJobs} color="text-yellow-600" />
        <StatCard label="Companies" value={stats.totalCompanies} color="text-indigo-600" />
      </div>

      {/* Applications by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">Applications by status</h3>
          <div className="space-y-3">
            {charts.applicationsByStatus.map((s) => {
              const total = charts.applicationsByStatus.reduce((a, b) => a + b.count, 0);
              const pct = total ? Math.round((s.count / total) * 100) : 0;
              const colorMap = {
                applied: "bg-blue-500",
                reviewing: "bg-yellow-500",
                shortlisted: "bg-purple-500",
                rejected: "bg-red-500",
                hired: "bg-green-500",
              };
              return (
                <div key={s._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{s._id}</span>
                    <span className="text-gray-500">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorMap[s._id] || "bg-gray-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {charts.applicationsByStatus.length === 0 && (
              <p className="text-sm text-gray-400">No applications yet</p>
            )}
          </div>
        </div>

        {/* Jobs by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">Jobs by type</h3>
          <div className="space-y-3">
            {charts.jobsByType.map((j) => {
              const total = charts.jobsByType.reduce((a, b) => a + b.count, 0);
              const pct = total ? Math.round((j.count / total) * 100) : 0;
              return (
                <div key={j._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{j._id}</span>
                    <span className="text-gray-500">{j.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {charts.jobsByType.length === 0 && (
              <p className="text-sm text-gray-400">No jobs yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Companies */}
      {data.topCompanies?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">Top companies by jobs posted</h3>
          <div className="space-y-3">
            {data.topCompanies.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {c.company.logo ? (
                    <img src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/company/${c.company.logo}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                      {c.company.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-gray-800">{c.company.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{c.jobCount} jobs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-800">Recent jobs</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Company</th>
              <th className="px-6 py-3 text-left">Location</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recent.recentJobs.map((job) => (
              <tr key={job._id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{job.title}</td>
                <td className="px-6 py-3 text-gray-600">{job.company?.name || "—"}</td>
                <td className="px-6 py-3 text-gray-600">{job.location}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    job.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {job.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-800">Recent users</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recent.recentUsers.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-6 py-3 text-gray-600">{u.email}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === "admin" ? "bg-purple-100 text-purple-700"
                    : u.role === "recruiter" ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                  }`}>{u.role}</span>
                </td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;