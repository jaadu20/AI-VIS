import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { CompanyRegistration } from "./pages/company/CompanyRegistration";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AIInterview } from "./pages/interview/AIInterview";
import { StudentProfile } from "./pages/student/StudentProfile";
import { JobPostingForm } from "./pages/company/JobPostingForm";
import { useAuthStore } from "./store/authStore";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Forgetpass } from "./pages/auth/Forgetpass";
import { CandidatesResult } from "./pages/company/CandidatesResult";
import { CompanyProfile } from "./pages/company/CompanyProfile";
import { Getstarted } from "./pages/Getstarted";

function PrivateRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/getstarted" element={<Getstarted />} />
        
        <Route path="/forgetpass" element={<Forgetpass />} />
        <Route
          path="/company/candidatesresults"
          element={<CandidatesResult />}
        />
        <Route path="/company/profile" element={<CompanyProfile />} />

        
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <AIInterview />
            </PrivateRoute>
          }
        />

        
        <Route path="/company/register" element={<CompanyRegistration />} />
        <Route
          path="/company/dashboard"
          element={
            <PrivateRoute allowedRoles={["company"]}>
              <CompanyDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/post-job"
          element={
            <PrivateRoute allowedRoles={["company"]}>
              <JobPostingForm />
            </PrivateRoute>
          }
        />

        
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
