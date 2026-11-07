import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../utils/axios';
import {
  Search, MapPin, Clock, Building2, Filter,
  X, Briefcase, ChevronLeft, ChevronRight
} from 'lucide-react';

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: '',
    jobType: '',
    salary: '',
    experience: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.location) params.append('location', filters.location);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.salary) params.append('salary', filters.salary);
      if (filters.experience) params.append('experience', filters.experience);
      params.append('page', page);
      params.append('limit', 9);

      const res = await API.get(`/job?${params.toString()}`);
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      jobType: '',
      salary: '',
      experience: ''
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) =>
                  setFilters({ ...filters, keyword: e.target.value })
                }
                placeholder="Job title, skills, keywords..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 
                rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                placeholder="Location"
                className="w-full md:w-48 pl-11 pr-4 py-3 border border-gray-300 
                rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl 
              font-semibold hover:bg-blue-700 transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 border border-gray-300 
              px-4 py-3 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              <Filter size={18} /> Filters
            </button>
          </form>

          {/* Filter Row */}
          {showFilter && (
            <div className="mt-4 flex flex-wrap gap-3">
              <select
                value={filters.jobType}
                onChange={(e) =>
                  setFilters({ ...filters, jobType: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>

              <select
                value={filters.experience}
                onChange={(e) =>
                  setFilters({ ...filters, experience: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Experience</option>
                <option value="0">Fresher</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>

              <input
                type="number"
                value={filters.salary}
                onChange={(e) =>
                  setFilters({ ...filters, salary: e.target.value })
                }
                placeholder="Min salary"
                className="px-4 py-2 border border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-36"
              />

              <button
                onClick={() => { clearFilters(); fetchJobs(); }}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 
                text-sm font-medium"
              >
                <X size={16} /> Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-gray-500 mb-6">
          Showing <span className="font-semibold text-gray-800">{total}</span> jobs
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 
            border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Briefcase size={56} className="mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p>Try different keywords or clear filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 border 
                  border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40 
                  disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} /> Prev
                </button>

                <div className="flex gap-2">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-medium transition
                        ${page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages}
                  className="flex items-center gap-1 px-4 py-2 border 
                  border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40 
                  disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Job Card
const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition 
      cursor-pointer border border-gray-100 hover:border-blue-200"
    >
      <div className="flex items-center gap-3 mb-4">
        {job.company?.logo ? (
          <img
            src={`${import.meta.env.VITE_UPLOADS_BASE_URL}/${job.company.logo}`}
            alt={job.company?.name}
            className="w-12 h-12 rounded-xl object-cover border border-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center 
          justify-center">
            <Building2 className="text-blue-600" size={22} />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800">{job.company?.name}</p>
          <p className="text-sm text-gray-400">{job.company?.location}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
        {job.title}
      </h3>
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 
        rounded-full font-medium">
          {job.jobType}
        </span>
        <span className="bg-green-50 text-green-600 text-xs px-3 py-1 
        rounded-full font-medium">
          {job.experience} yrs
        </span>
        {job.salary > 0 && (
          <span className="bg-yellow-50 text-yellow-600 text-xs px-3 py-1 
          rounded-full font-medium">
            ₹{job.salary.toLocaleString()}/mo
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Jobs;