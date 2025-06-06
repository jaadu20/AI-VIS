import { useEffect, useState } from "react";
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
  Video,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Footer } from "../../components/Footer";
import { toast, Toaster } from "react-hot-toast";
import api from "../../api";

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: "candidate" | "company";
  phone: string;
  name: string;
  company_name?: string;
  company_address?: string;
}

export function Signup() {
  const navigate = useNavigate();
  {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, []);
  }
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"candidate" | "company">(
    "candidate"
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: { role: "candidate" },
  });

  const password = watch("password");

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
          company_name: data.name,
          company_address: data.company_address,
        }),
      };

      await api.post("/api/auth/signup/", payload);

      toast.success("Account created successfully!", {
        position: "top-right",
        duration: 2000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";

      // Improved error handling
      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle field-specific errors
        if (typeof errorData === "object") {
          errorMessage = Object.entries(errorData)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(" ") : value}`
            )
            .join(". ");
        }
        // Handle generic error messages
        else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 flex flex-col">
      <Toaster position="top-right" />

      {/* Header with slide-down animation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-md border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              AI-VIS
            </h1>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            {["Home", "How It Works", "Pricing", "Contact Us"].map(
              (label, i) => (
                <motion.button
                  key={i}
                  onClick={() =>
                    navigate(
                      label === "Home"
                        ? "/"
                        : label === "How It Works"
                        ? "/about"
                        : label === "Pricing"
                        ? "/pricing"
                        : "/contact"
                    )
                  }
                  className="text-gray-600 hover:text-blue-600 font-medium relative after:block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full hover:after:transition-width after:transition-all"
                >
                  {label}
                </motion.button>
              )
            )}
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 shadow-md shadow-blue-200"
              >
                Login
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Main Content with Improved Positioning */}
      <div className="flex-1 flex flex-col pt-24">
        <div className="max-w-7xl w-full mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Back to home & welcome text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 sticky top-32"
          >
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </motion.button>

            <div className="space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                Get Started
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Create your
                <span className="block text-blue-700 mt-2">AI-VIS Account</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Join AI-VIS today and transform your hiring or interview
                experience with AI-powered analytics.
              </p>

              <div className="pt-4">
                <div className="flex flex-col gap-4">
                  {[
                    "Real-time interview analytics",
                    "Comprehensive candidate scoring",
                    "AI-powered interview insights",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Signup Form - Enhanced Positioning */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full flex justify-center"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Account
                </h2>
                <p className="mt-2 text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register("role", { required: "Role is required" })}
                      onChange={(e) =>
                        setSelectedRole(
                          e.target.value as "candidate" | "company"
                        )
                      }
                      className="pl-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="candidate">Candidate</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      {...register("name", {
                        required: `${
                          selectedRole === "company"
                            ? "Company name"
                            : "Full name"
                        } is required`,
                      })}
                      type="text"
                      placeholder={
                        selectedRole === "company" ? "Acme Inc." : "John Doe"
                      }
                      className="pl-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Company Address Field - Only for companies */}
                {selectedRole === "company" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        type="text"
                        placeholder="123 Business Ave, City"
                        className="pl-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                      />
                    </div>
                    {errors.company_address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.company_address.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Two-column layout for Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            value: /^[+][0-9]?/,
                            message: "Invalid phone number format",
                          },
                        })}
                        type="tel"
                        placeholder="+92 300 1234567"
                        className="pl-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          pattern: {
                            value:
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message:
                              "Password must contain uppercase, lowercase, number and special character",
                          },
                        })}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:bg-blue-800 shadow-lg shadow-blue-200/50 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="#0A66C2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  LinkedIn
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">
              Secure signup with 256-bit encryption. We prioritize your data
              security.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
