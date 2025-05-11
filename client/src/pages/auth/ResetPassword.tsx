// ResetPassword.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Video, ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Footer } from "../../components/Footer";
import api from "../../api";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    
    // Verify token validity
    const verifyToken = async () => {
      try {
        await api.get(`/api/auth/verify-reset-token/${token}`);
      } catch (err) {
        setTokenValid(false);
        toast.error("Invalid or expired reset link");
      }
    };
    
    verifyToken();
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch("password", "");

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/reset-password/", {
        token,
        password: data.password,
      });
      
      setResetSuccess(true);
      toast.success("Password reset successful!");
    } catch (err) {
      let errorMessage = "Failed to reset password. Please try again.";
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        errorMessage = "Invalid or expired token";
      }
      toast.error(errorMessage);
      console.error("Password reset error:", err);
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
                onClick={() => navigate("/signup")}
                className="bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 shadow-md shadow-blue-200"
              >
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col pt-24">
        <div className="max-w-7xl w-full mx-auto px-4 py-8 flex flex-col md:flex-row gap-12 items-center">
          {/* Left Column: Back to login & info text */}
          <div className="md:w-1/2 space-y-8">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                Password Reset
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Create new
                <span className="block text-blue-700 mt-2">password</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Please create a strong password for your AI-VIS account to keep your data secure.
              </p>

              <div className="pt-4">
                <div className="flex flex-col gap-4">
                  {[
                    "Use at least 8 characters",
                    "Include uppercase and lowercase letters",
                    "Add numbers and special characters"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Reset Password Form */}
          <div className="md:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md mx-auto"
            >
              {!tokenValid ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h3>
                  <p className="text-gray-600 mb-6">
                    This password reset link is invalid or has expired. Please request a new link.
                  </p>
                  <Button
                    onClick={() => navigate("/forgetpass")}
                    className="bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:bg-blue-800"
                  >
                    Request New Link
                  </Button>
                </div>
              ) : !resetSuccess ? (
                <>
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
                    <p className="mt-2 text-gray-600">
                      Enter and confirm your new password
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* Password Field */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
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
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                              message: "Password must include uppercase, lowercase, number and special character",
                            },
                          })}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: value =>
                              value === password || "Passwords do not match",
                          })}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 block w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:bg-blue-800 shadow-md shadow-blue-200/50 flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? "Resetting..." : "Reset Password"}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h3>
                  <p className="text-gray-600 mb-6">
                    Your password has been updated successfully. You can now login with your new password.
                  </p>
                  <Button
                    onClick={() => navigate("/login")}
                    className="bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:bg-blue-800"
                  >
                    Return to Login
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">
              Your password is securely encrypted. We never store passwords in plain text.
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