import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute, RecruiterRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import NotFound from './pages/NotFound';

// User pages
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import EditJob from './pages/recruiter/EditJob';
import Applicants from './pages/recruiter/Applicants';
import Company from './pages/recruiter/Company';

// Admin pages — SIRF Admin/ folder se (capital A)
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCompanies from './pages/admin/AdminCompanies';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>

          {/* ── Public routes (Navbar dikhega) ── */}
          <Route element={<><Navbar /><Outlet /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
          </Route>

          {/* ── User private routes (Navbar dikhega) ── */}
          <Route element={<><Navbar /><Outlet /></>}>
            <Route
              path="/dashboard"
              element={<PrivateRoute><Dashboard /></PrivateRoute>}
            />
            <Route
              path="/profile"
              element={<PrivateRoute><Profile /></PrivateRoute>}
            />
          </Route>

          {/* ── Recruiter routes (Navbar dikhega) ── */}
          <Route element={<><Navbar /><Outlet /></>}>
            <Route
              path="/recruiter/dashboard"
              element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>}
            />
            <Route
              path="/recruiter/post-job"
              element={<RecruiterRoute><PostJob /></RecruiterRoute>}
            />
            <Route
              path="/recruiter/edit-job/:id"
              element={<RecruiterRoute><EditJob /></RecruiterRoute>}
            />
            <Route
              path="/recruiter/applicants/:id"
              element={<RecruiterRoute><Applicants /></RecruiterRoute>}
            />
            <Route
              path="/recruiter/company"
              element={<RecruiterRoute><Company /></RecruiterRoute>}
            />
          </Route>

          {/* ── Admin routes (AdminLayout = apna sidebar, NO Navbar) ── */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="companies" element={<AdminCompanies />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;