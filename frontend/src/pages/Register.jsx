import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Briefcase, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register', formData);
      toast.success(res.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 
    flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Briefcase className="text-blue-600" size={32} />
          <span className="text-2xl font-bold text-gray-900">
            Job<span className="text-blue-600">Portal</span>
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
        <p className="text-gray-500 mb-6">Join us today, it's free!</p>

        {/* Role Selector */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {['user', 'recruiter'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFormData({ ...formData, role: r })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize
                ${formData.role === r
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {r === 'user' ? 'Job Seeker' : 'Recruiter'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-transparent transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 
                text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Role Info Box */}
          <div className={`p-3 rounded-xl text-sm ${
            formData.role === 'user'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-purple-50 text-purple-700'
          }`}>
            {formData.role === 'user'
              ? '👤 As a Job Seeker you can search and apply for jobs'
              : '🏢 As a Recruiter you can post jobs and manage applicants'
            }
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold
            hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;