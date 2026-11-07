import { useEffect, useState } from "react";
import axios from "../../utils/axios";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get("/admin/companies");
      setCompanies(data.companies);
    } catch { } finally { setLoading(false); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company? All its jobs and applications will also be deleted.")) return;
    try {
      await axios.delete(`/admin/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      showToast("Company deleted successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Error");
    }
  };

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
        <h2 className="text-2xl font-semibold text-gray-900">All Companies</h2>
        <span className="text-sm text-gray-500">{companies.length} total</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companies.map((company) => (
          <div key={company._id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {company.logo ? (
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/uploads/${company.logo}`}
                    className="w-10 h-10 rounded-lg object-cover"
                    alt={company.name}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {company.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.location || "No location"}</p>
                </div>
              </div>
            </div>

            {company.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{company.description}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Recruiter</p>
                <p className="text-sm text-gray-700">{company.userId?.name || "—"}</p>
              </div>
              <button
                onClick={() => handleDelete(company._id)}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <p className="text-gray-400 text-sm col-span-3 py-10 text-center">No companies found</p>
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;