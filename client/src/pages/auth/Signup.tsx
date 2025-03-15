import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Building2,
  Phone,
  Briefcase,
  MapPin,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";
import { Footer } from "../../components/Footer";
import { toast, Toaster } from "react-hot-toast";
import api from "../../api";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  role: "student" | "company";
  phone: string;
  company_name?: string;
  company_address?: string;
}

interface ApiResponse {
  access: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    phone: string;
    company_name?: string;
    company_address?: string;
  };
}

export function Signup() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "company">(
    "student"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: { role: "student" },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const payload = {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: data.role,
        ...(data.role === "company" && {
          company_name: data.company_name,
          company_address: data.company_address,
        }),
      };

      const response = await api.post<ApiResponse>(
        "/api/auth/signup/",
        payload
      );

      localStorage.setItem("access_token", response.data.access);

      setUser(
        {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role as "student" | "company" | "admin",
          name: response.data.user.name,
          phone: response.data.user.phone,
          ...(response.data.user.role === "company" && {
            company_name: response.data.user.company_name,
            company_address: response.data.user.company_address,
          }),
        },
        response.data.access
      );

      navigate(
        response.data.user.role === "company"
          ? "/company/dashboard"
          : "/student/dashboard"
      );

      toast.success("Account created successfully!", {
        position: "top-right",
        duration: 3000,
        style: { background: "#4caf50", color: "#fff" },
      });
    } catch (err: any) {
      const backendError = err.response?.data;
      let errorMessage = "Registration failed. Please try again.";

      // Handle Django validation errors
      if (backendError) {
        if (typeof backendError === "object") {
          errorMessage = Object.values(backendError).flat().join(". ");
        } else if (typeof backendError === "string") {
          errorMessage = backendError;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        duration: 3000,
        style: { background: "#f44336", color: "#fff" },
      });
      console.error("Signup error:", err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <Toaster />

      {/* Header */}
      <header className="fixed w-full bg-black bg-opacity-100 py-4 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-yellow-300 tracking-wide">
            AI VIS
          </h1>
          <nav className="space-x-6 text-lg">
            <button
              onClick={() => navigate("/")}
              className="text-gray-200 hover:text-yellow-300"
            >
              Home
            </button>
            <button className="text-gray-200 hover:text-yellow-300">
              About Us
            </button>
            <button
              onClick={() => navigate("/getstarted")}
              className="text-gray-200 hover:text-yellow-300"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-gray-200 hover:text-yellow-300"
            >
              Contact
            </button>
          </nav>
          <Button
            className="bg-yellow-400 text-indigo-900 px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="items-center max-w-7xl mx-auto px-4 py-12"
      >
        <h2 className="text-center text-3xl font-extrabold text-yellow-300 leading-tight mt-16">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-yellow-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Sign in here
          </button>
        </p>
      </motion.div>

      {/* Form Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white/90 backdrop-blur-sm py-6 px-4 shadow-xl rounded-2xl sm:px-6">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register("role", { required: "Role is required" })}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as "student" | "company")
                  }
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                >
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                </select>
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role.message}</p>
              )}
            </div>

            {/* Name/Company Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedRole === "company" ? "Company Name" : "Full Name"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {selectedRole === "company" ? (
                    <Building2 className="h-5 w-5 text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Company Address Field */}
            {selectedRole === "company" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("company_address", {
                      required: "Company address is required",
                    })}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                  />
                </div>
                {errors.company_address && (
                  <p className="text-red-500 text-sm">
                    {errors.company_address.message}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[+]?[0-9\s-()]{7,}$/,
                      message: "Invalid phone number format",
                    },
                  })}
                  type="tel"
                  placeholder="+1 (555) 555-5555"
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type="password"
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
