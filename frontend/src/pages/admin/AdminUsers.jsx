import { useEffect, useState } from "react";
import axios from "../../utils/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/admin/users");
      setUsers(data.users);
    } catch { } finally { setLoading(false); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Toggle block — your backend does toggle, no body needed
  const handleBlock = async (userId, currentlyBlocked) => {
    try {
      const { data } = await axios.put(`/admin/users/block/${userId}`);
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isBlocked: data.isBlocked } : u)
      );
      showToast(data.message);
    } catch (err) {
      showToast(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? All their applications will also be deleted.")) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast("User deleted successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Error");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">All Users</h2>
        <span className="text-sm text-gray-500">{filtered.length} of {users.length}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-gray-600">{user.email}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "admin" ? "bg-purple-100 text-purple-700"
                    : user.role === "recruiter" ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                  }`}>{user.role}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  {user.role !== "admin" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBlock(user._id, user.isBlocked)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          user.isBlocked
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Protected</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;