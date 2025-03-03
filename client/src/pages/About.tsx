import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";


export function About() {
  const navigate = useNavigate();

 
  const scrollToSection = (id: number) => {
    const section = document.getElementById(id);
    section.scrollIntoView({ behavior: "smooth" });
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
            <button
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
          <Button className="bg-yellow-400 text-indigo-900 px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500"  onClick={() => navigate("/login?student")}>
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
            About <span className="text-indigo-400">AI VIS</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          At AI-VIS, we aim to make hiring simple, efficient, and unbiased. Our platform uses Artificial Intelligence to analyze candidates' responses, voice tones, and facial expressions, helping recruiters make fair and informed decisions.

We focus on solving common recruitment challenges like delays, human bias, and inconsistent evaluations. By combining advanced technologies like Natural Language Processing, Computer Vision, and Deep Learning, AI-VIS provides a seamless interview experience for both employers and candidates.

Join us in transforming the recruitment process into something smarter, faster, and more reliable.          </p>
          
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://img.freepik.com/premium-photo/robot-with-phone-his-head-words-robot-screen_979520-82756.jpg"
            alt="AI Bot"
            className="w-full max-w-md md:max-w-lg drop-shadow-2xl rounded-lg"
          />
        </div>
      </motion.div>

      
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
            <Button className="w-full bg-yellow-400 text-indigo-900 px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500">
              Send Message
            </Button>
          </form>
        </div>
      </div>

   
      <footer className="bg-transparent text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0 text-lg">&copy; 2025 AI VIS. All rights reserved.</p>
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

