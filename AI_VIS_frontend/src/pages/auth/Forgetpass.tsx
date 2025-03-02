import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { toast, Toaster } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";


interface LoginForm {
  email: string;
}

export function Forgetpass() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "student";
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      
      toast.success("Verification email sent successfully!", {
        position: "top-right",
        duration: 4000,
        style: {
          background: "#4caf50",
          color: "#fff",
        },
        icon: "📧",
      });

      
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    } catch (err) {
      setError("Failed to send verification email");
    }
  };

  return (    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen bg-cover bg-center text-black"
    style={{
      backgroundImage:
        "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
      backgroundAttachment: "fixed",
    }}>
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 className="text-center text-3xl font-extrabold text-gray-900 font-bold text-yellow-300 leading-tight mb-6">
         
          Forget Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-yellow-600">
          Or{" "}
          <button
            onClick={() => navigate(`/signup?type=${userType}`)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </button>
        </p>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" className="w-full">
              Verify Your Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
