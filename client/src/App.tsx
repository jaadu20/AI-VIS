import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { CompanyDashboard } from "./pages/company/Dashboard";
import { CandidateDashboard } from "./pages/candidate/Dashboard";
import { AIInterview } from "./pages/interview/AIInterview";
import { InterviewProgress } from "./pages/interview/InterviewProgress";
import { CandidateProfile } from "./pages/candidate/CandidateProfile";
import { JobPostingForm } from "./pages/company/JobPostingForm";
import { useAuthStore } from "./store/authStore";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { ForgetPassword } from "./pages/auth/ForgetPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { CandidatesResult } from "./pages/company/CandidatesResult";
import { CompanyProfile } from "./pages/company/CompanyProfile";
import { JobApplicationPage } from "./pages/candidate/JobApplicationPage";
import { Pricing } from "./pages/Pricing";
import CompanyJobList from "./pages/company/CompanyJobList";
function PrivateRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: ("candidate" | "company")[];
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
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgetpass" element={<ForgetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />

        {/* Company Routes */}
        <Route
          path="/company/:Id/dashboard"
          element={
            <PrivateRoute allowedRoles={["company"]}>
              <CompanyDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/candidatesresults/:jobId"
          element={
            <PrivateRoute allowedRoles={["company"]}>
              <CandidatesResult />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/profile/:userId"
          element={
            <PrivateRoute allowedRoles={["company"]}>
              <CompanyProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/post-job/:jobId"
          element={
            <PrivateRoute allowedRoles={["company"]}>
              <JobPostingForm />
            </PrivateRoute>
          }
        />

        {/* Candidate Routes */}
        <Route
          path="/candidate/:Id/dashboard"
          element={
            <PrivateRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate/profile/:userId"
          element={
            <PrivateRoute allowedRoles={["candidate"]}>
              <CandidateProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview/:applicationId"
          element={
            <PrivateRoute allowedRoles={["candidate"]}>
              <AIInterview />
            </PrivateRoute>
          }
        />
        <Route path="/complete" element={<InterviewProgress />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/jobs/:jobId/apply" element={<JobApplicationPage />} />
        <Route
          path="/jobs/company/:companyId"
          element={
            <PrivateRoute allowedRoles={["company"]}>
              <CompanyJobList />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
