import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, Home, Info, Rocket, PhoneCall } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { toast, Toaster } from "react-hot-toast";
import { Footer } from "../../components/Footer";
import api from "../../api";

interface ForgetPassForm {
  email: string;
}

export function Forgetpass() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPassForm>();

  const onSubmit = async (data: ForgetPassForm) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/forgot-password/", {
        email: data.email,
      });

      if (response.status === 200) {
        toast.success("Password reset email sent! Check your inbox", {
          position: "top-right",
          duration: 4000,
          style: { background: "#4caf50", color: "#fff" },
        });
        setTimeout(() => navigate("/login"), 4000);
      }
    } catch (err: any) {
      const backendError = err.response?.data;
      let errorMessage = "Failed to send reset email. Please try again.";

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
        duration: 4000,
        style: { background: "#f44336", color: "#fff" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-black"
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
              <Home className="mr-1 inline h-5 w-5" /> Home
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-gray-200 hover:text-yellow-300"
            >
              <Info className="mr-1 inline h-5 w-5" /> About
            </button>
            <button
              onClick={() => navigate("/getstarted")}
              className="text-gray-200 hover:text-yellow-300"
            >
              <Rocket className="mr-1 inline h-5 w-5" /> Get Started
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-gray-200 hover:text-yellow-300"
            >
              <PhoneCall className="mr-1 inline h-5 w-5" /> Contact
            </button>
          </nav>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md mt-24">
          <h2 className="text-center text-3xl font-extrabold text-yellow-300 mb-6">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-yellow-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl rounded-2xl sm:px-10 mb-28">
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
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center text-sm">
                <button
                  onClick={() => navigate("/signup")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
