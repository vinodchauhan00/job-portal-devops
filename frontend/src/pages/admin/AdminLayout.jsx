import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";

const navItems = [
  { label: "Dashboard", path: "/admin" },
  { label: "Users", path: "/admin/users" },
  { label: "Jobs", path: "/admin/jobs" },
  { label: "Companies", path: "/admin/companies" },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Job Portal</h1>
          <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full mt-1 inline-block">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;