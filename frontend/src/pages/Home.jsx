
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Users,
  Building2,
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import API from '../utils/axios';

const Home = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0
  });

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  // Fetch Recent Jobs from Backend API
  const fetchRecentJobs = async () => {
    try {
      const res = await API.get('/job?limit=6');

      // Check actual API response
      console.log('Jobs API Response:', res.data);

      // Prevent undefined jobs error
      const jobs = Array.isArray(res.data.jobs)
        ? res.data.jobs
        : [];

      setRecentJobs(jobs);

      setStats({
        totalJobs: res.data.total || 0,
        totalUsers: 1200,
        totalCompanies: 300
      });

    } catch (error) {
      console.log('Fetch Jobs Error:', error);

      // Keep jobs as an empty array if API fails
      setRecentJobs([]);
    }
  };

  // Search Jobs
  const handleSearch = (e) => {
    e.preventDefault();

    if (keyword.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800
        text-white py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Find Your Dream
            <span className="text-yellow-400"> Job Today</span>
          </h1>

          <p className="text-blue-100 text-lg md:text-xl mb-10">
            Thousands of jobs from top companies. Start your journey now.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />

              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skills, keywords..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800
                focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
              />
            </div>

            <button
              type="submit"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl
              font-bold hover:bg-yellow-300 transition text-base"
            >
              Search Jobs
            </button>
          </form>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-blue-200 text-sm">Popular:</span>

            {['React', 'Node.js', 'Python', 'UI/UX', 'Data Science'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag)}`)}
                className="text-sm bg-white/10 hover:bg-white/20 text-white
                px-3 py-1 rounded-full transition"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {[
            {
              icon: <Briefcase className="text-blue-600" size={32} />,
              value: stats.totalJobs + '+',
              label: 'Jobs Available'
            },
            {
              icon: <Users className="text-green-600" size={32} />,
              value: '1200+',
              label: 'Registered Users'
            },
            {
              icon: <Building2 className="text-purple-600" size={32} />,
              value: '300+',
              label: 'Top Companies'
            }
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-6 rounded-2xl bg-gray-50
              hover:shadow-md transition"
            >
              {stat.icon}

              <h3 className="text-3xl font-bold text-gray-800 mt-3">
                {stat.value}
              </h3>

              <p className="text-gray-500 mt-1">
                {stat.label}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Latest Jobs
              </h2>

              <p className="text-gray-500 mt-1">
                Fresh opportunities just posted
              </p>
            </div>

            <Link
              to="/jobs"
              className="flex items-center gap-2 text-blue-600 font-semibold
              hover:underline"
            >
              View all <ArrowRight size={18} />
            </Link>
          </div>

          {/* Safe Array Check */}
          {recentJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />

              <p className="text-lg">
                No jobs posted yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {recentJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}

            </div>
          )}

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-900 text-white text-center">
        <div className="max-w-2xl mx-auto">

          <h2 className="text-3xl font-bold mb-4">
            Are you an Employer?
          </h2>

          <p className="text-blue-100 mb-8 text-lg">
            Post jobs and find the best talent for your company
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl
              font-bold hover:bg-blue-50 transition"
            >
              Post a Job
            </Link>

            <Link
              to="/jobs"
              className="border-2 border-white text-white px-8 py-3 rounded-xl
              font-bold hover:bg-white/10 transition"
            >
              Browse Jobs
            </Link>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">

          <Briefcase className="text-blue-400" size={20} />

          <span className="text-white font-bold text-lg">
            Job<span className="text-blue-400">Portal</span>
          </span>

        </div>

        <p className="text-sm">
          © 2024 JobPortal. All rights reserved.
        </p>
      </footer>

    </div>
  );
};


// Job Card Component
const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition
      cursor-pointer border border-gray-100 hover:border-blue-200"
    >

      {/* Company Logo + Name */}
      <div className="flex items-center gap-3 mb-4">

        {job.company?.logo ? (
          <img
            src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/company/${job.company.logo}`}
            alt={job.company.name || 'Company'}
            className="w-12 h-12 rounded-xl object-cover border border-gray-100"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl bg-blue-100 flex items-center
            justify-center"
          >
            <Building2 className="text-blue-600" size={22} />
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-800">
            {job.company?.name || 'Company'}
          </p>

          <p className="text-sm text-gray-400">
            {job.company?.location || 'Location not specified'}
          </p>
        </div>

      </div>

      {/* Job Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
        {job.title || 'Untitled Job'}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
        {job.description || 'No description available'}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">

        <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
          {job.jobType || 'Not specified'}
        </span>

        <span className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full font-medium">
          {job.experience ?? 0} yrs exp
        </span>

        {Number(job.salary) > 0 && (
          <span
            className="bg-yellow-50 text-yellow-600 text-xs px-3 py-1
            rounded-full font-medium"
          >
            ₹{Number(job.salary).toLocaleString()}/mo
          </span>
        )}

      </div>

      {/* Location + Date */}
      <div className="flex items-center justify-between text-sm text-gray-400">

        <div className="flex items-center gap-1">
          <MapPin size={14} />

          <span>
            {job.location || 'Location not specified'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Clock size={14} />

          <span>
            {job.createdAt
              ? new Date(job.createdAt).toLocaleDateString()
              : 'Date unavailable'}
          </span>
        </div>

      </div>

    </div>
  );
};

export default Home;
