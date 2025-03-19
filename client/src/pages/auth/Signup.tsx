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
import { Footer } from "../../components/Footer";
import { toast, Toaster } from "react-hot-toast";
import api from "../../api";

interface SignupForm {
  email: string;
  password: string;
  role: "candidate" | "company";
  phone: string;
  name: string;
  company_address?: string;
}

export function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"candidate" | "company">(
    "candidate"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: { role: "candidate" },
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
          company_address: data.company_address,
        }),
      };

      await api.post("/api/auth/signup/", payload);

      toast.success("Account created successfully! Redirecting...", {
        position: "top-right",
        duration: 2000,
      });
      navigate("/login");
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
        duration: 3000,
      });
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
              About
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
          Start Your Journey
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

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl rounded-2xl sm:px-6 mb-8">
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
                    setSelectedRole(e.target.value as "candidate" | "company")
                  }
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                >
                  <option value="candidate">Candidate</option>
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
                  {...register("name", { required: "This field is required" })}
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
                      message: "Minimum 8 characters required",
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

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-all duration-300"
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
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
