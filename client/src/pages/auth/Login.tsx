import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import api from "../../api";

interface LoginForm {
  email: string;
  password: string;
}

export function Login() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "student";
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      // Call the API to log in
      const response = await api.post("/login/", {
        email: data.email,
        password: data.password,
      });

      // Save the access token to localStorage
      localStorage.setItem("access_token", response.data.access);

      // Set user in the global state
      setUser({
        id: "1", // Replace with actual user ID from the API
        email: data.email,
        role: userType as "student" | "company" | "admin",
        name: "John Doe", // Replace with actual name from the API
      });

      // Redirect based on user type
      switch (userType) {
        case "student":
          navigate("/student/dashboard");
          break;
        case "company":
          navigate("/company/dashboard");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", err);
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
          Sign in to your Account
        </h2>
        <p className="mt-2 text-center text-sm text-yellow-600">
          Or{" "}
          <button
            onClick={() => navigate(`/signup?type=${userType}`)}
            className="font-medium text-blue-600 hover:text-white-500 font-bold text-white-300 leading-tight mb-6"
          >
            create a new account
          </button>
        </p>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                  className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md text-black"
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
                  className="pl-10 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md text-black"
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
              Sign in
            </Button>
            <p className="mt-2 text-center text-sm text-gray-600">
              {" "}
              <button
                onClick={() => navigate(`/forgetpass`)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forget password?
              </button>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
