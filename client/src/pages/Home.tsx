import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { About } from "./About";

export function Home() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
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
      <header className="fixed w-full bg-black bg-opacity-100 py-4 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-yellow-300 tracking-wide">
            AI VIS
          </h1>
          <nav className="space-x-6 text-lg">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-gray-200 hover:text-yellow-300"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-gray-200 hover:text-yellow-300"
            >
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
            onClick={() => navigate("/login?student")}
          >
            Login
          </Button>
        </div>
      </header>

      <motion.div
        id="hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-4 py-20"
        style={{ paddingTop: "100px" }}
      >
        <div className="md:w-1/2 text-center md:text-left mt-10">
          <h1 className="text-6xl font-bold text-yellow-300 leading-tight mb-6">
            Revolutionize Hiring with{" "}
            <span className="text-indigo-400">AI VIS</span>
          </h1>
          <div className="bg-black/50 rounded-lg p-4 mb-4">
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              AI-VIS is your ultimate recruitment partner, designed to simplify
              hiring and empower careers. For HR professionals, it identifies
              top talent with precision and fairness. For candidates, it
              provides a platform to shine and showcase your potential.
              Experience smarter, unbiased hiring and take the first step into
              the future of recruitment today{" "}
            </p>
          </div>
          <Button
            onClick={() => navigate(`/signup`)}
            className="bg-purple-600 text-white px-8 py-3 text-lg rounded-lg shadow-lg hover:bg-purple-700"
          >
            Register Now
          </Button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://img.freepik.com/premium-photo/cute-robot-with-headset-notebook-exemplifies-automation-customer-service_795881-12769.jpg?w=900"
            alt="Cute robot with headset and notebook"
            className="w-full max-w-md md:max-w-lg drop-shadow-2xl rounded-lg"
          />
        </div>
      </motion.div>

      <div id="pricing" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-5xl font-bold text-center text-white mb-12">
          Transforming the Way Talent Meets Opportunity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "For Candidates",
              description:
                "Discover opportunities and showcase your skills to top companies.",
              icon: GraduationCap,
              action: () => navigate("/signup?type=student"),
              color: "bg-blue-500",
            },
            {
              title: "For HRs",
              description:
                "Find the perfect candidates using our AI-powered matching system.",
              icon: Briefcase,
              action: () => navigate("/signup?type=company"),
              color: "bg-green-500",
            },
            {
              title: "Admin Portal",
              description:
                "Manage and monitor platform activities and user interactions.",
              icon: ShieldCheck,
              action: () => navigate("/login?type=admin"),
              color: "bg-purple-500",
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.05 }}
              className="bg-black bg-opacity-70 rounded-xl shadow-lg p-8 text-center hover:shadow-xl"
            >
              <div
                className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                {item.title}
              </h2>
              <p className="text-gray-300 mb-6">{item.description}</p>
              <Button
                onClick={item.action}
                className="w-full bg-indigo-500 text-white hover:bg-indigo-600"
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div id="contact" className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">Contact Us</h2>
          <form className="max-w-lg mx-auto space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white"
            />
            <textarea
              placeholder="Your Message"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white"
            ></textarea>
            <Button
              className="w-full bg-yellow-400 text-indigo-900 px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500"
              onClick={() => {
                // Handle form submission
                console.log("Form submitted");
              }}
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>

      <footer className="bg-transparent text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0 text-lg">
            &copy; 2025 AI VIS. All rights reserved.
          </p>
          <div className="space-x-4 text-lg">
            <a href="#" className="hover:text-yellow-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-yellow-400">
              Terms of Service
            </a>
            <a href="#" className="hover:text-yellow-400">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
