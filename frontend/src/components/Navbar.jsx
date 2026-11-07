import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import toast from 'react-hot-toast';
import { Menu, X, Briefcase, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await API.get('/auth/logout');
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-gray-900">
              Job<span className="text-blue-600">Portal</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/jobs"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Find Jobs
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {user.profile?.profilePhoto ? (
                    <img
                      src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${user.profile.profilePhoto}`}
                      alt="profile"
                      className="w-9 h-9 rounded-full object-cover border-2 border-blue-600"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-700">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">

                    {user.role === 'user' && (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <User size={16} /> Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'recruiter' && (
                      <Link
                        to="/recruiter/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard size={16} /> Admin Panel
                      </Link>
                    )}

                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
            <Link
              to="/jobs"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Find Jobs
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {user.role === 'user' && (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                )}
                {user.role === 'recruiter' && (
                  <Link
                    to="/recruiter/dashboard"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;