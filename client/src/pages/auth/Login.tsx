import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";
import { Footer } from "../../components/Footer";
import api from "../../api";
import { toast, Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

interface LoginForm {
  email: string;
  password: string;
}

interface DecodedToken {
  id: string;
  email: string;
  role: "candidate" | "company";
  name: string;
  phone: string;
  company_name?: string;
  company_address?: string;
}

export function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/login/", {
        email: data.email,
        password: data.password,
      });

      const decoded: DecodedToken = jwtDecode(response.data.access);

      // Set user with all profile data including phone
      setUser(
        {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
          phone: decoded.phone,
          ...(decoded.role === "company" && {
            company_name: decoded.company_name,
            company_address: decoded.company_address,
          }),
        },
        response.data.access
      );
      // Redirect based on role
      const dashboardPaths = {
        candidate: "/candidate/dashboard",
        company: "/company/dashboard",
      };

      navigate(dashboardPaths[decoded.role], {
        replace: true,
        state: { fromLogin: true }, // Optional: Add state if needed
      });

      toast.success("Login successful!");
    } catch (err) {
      let errorMessage = "Login failed. Please check your credentials.";
      if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      }
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", err);
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
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="items-center max-w-7xl mx-auto px-4 py-20"
      >
        <h2 className="text-center text-3xl font-extrabold text-yellow-300 leading-tight mt-12">
          Sign in to your Account
        </h2>
        <p className="mt-4 text-center text-sm text-yellow-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Create one here
          </button>
        </p>
      </motion.div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl rounded-2xl sm:px-10 mb-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Minimum 8 characters" },
                  })}
                  type="password"
                  className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign in"}
            </Button>

            <p className="mt-2 text-center text-sm text-gray-600">
              <button
                onClick={() => navigate("/forgetpass")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
