import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { User, Mail, Lock, Building2, Phone } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";
import { Footer } from "../../components/Footer";
import api from "../../api";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
}

export function Signup() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "student";
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    try {
      // Call the API to register the user
      const response = await api.post("/signup/", {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        is_company: userType === "company",
        company_name: userType === "company" ? data.company : "",
      });

      // Save the access token to localStorage
      localStorage.setItem("access_token", response.data.access);

      // Set user in the global state
      setUser({
        id: "1", // Replace with actual user ID from the API
        email: data.email,
        role: userType as "student" | "company" | "admin",
        name: data.name,
      });

      // Redirect based on user type
      switch (userType) {
        case "student":
          navigate("/student/dashboard");
          break;
        case "company":
          navigate("/company/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Signup error:", err);
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
      <header className="fixed w-full bg-black bg-opacity-60 py-4 z-10 shadow-md">
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
            <button>About Us</button>
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
            onClick={() => navigate("/login?student")}
          >
            Login
          </Button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="items-center max-w-7xl mx-auto px-4 py-20"
      >
        <h2 className="text-center text-3xl font-extrabold text-gray-900 font-bold text-yellow-300 leading-tight mb-6">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-yellow-600">
          Or{" "}
          <button
            onClick={() => navigate(`/login?type=${userType}`)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your account
          </button>
        </p>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {userType === "company" ? "Company Name" : "Full Name"}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {userType === "company" ? (
                    <Building2 className="h-5 w-5 text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                  className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

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
                  })}
                  type="password"
                  className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
