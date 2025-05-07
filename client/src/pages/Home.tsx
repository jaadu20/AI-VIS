  import { motion } from "framer-motion";
  import { useNavigate } from "react-router-dom";
  import {
    Briefcase,
    User,
    Video,
    Brain,
    Mic,
    Smile,
    Clock,
    BarChart,
    Star,
  } from "lucide-react";
  import { Button } from "../components/ui/Button";
  import interviewImg2 from "../assets/public/images/home2.png";
  import wavePattern from "../assets/public/images/blue.jpg";

  export function Home() {
    const navigate = useNavigate();
    const primaryBlue = "#2563eb";
    const secondaryBlue = "#1d4ed8";

    return (
      <div className="min-h-screen bg-white text-gray-800">
        {/* Header */}
        <header className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-sm border-b border-blue-50">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                AI-VIS
              </h1>
            </div>
            <nav className="hidden md:flex gap-8 items-center">
              <button
                onClick={() => navigate("/features")}
                className="text-gray-600 hover:text-blue-600"
              >
                Features
              </button>
              <button
                onClick={() => navigate("/how-it-works")}
                className="text-gray-600 hover:text-blue-600"
              >
                How It Works
              </button>
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/login?role=candidate")}
                  className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                >
                  Candidate Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login?role=company")}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Company Login
                </Button>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section
          className="pt-32 pb-20 px-4 bg-[url('/wave-pattern')] bg-cover"
          style={{ backgroundImage: `url(${wavePattern})` }}
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-gray-900"
              >
                Next-Gen AI-Powered
                <span className="block text-blue-700 mt-2">
                  Video Interview Platform
                </span>
              </motion.h1>
              <p className="text-xl text-gray-600">
                Revolutionize hiring with real-time AI analysis, dynamic
                questioning, and comprehensive candidate evaluation through
                intelligent video interviews.
              </p>
              <div className="flex gap-4">
                <Button
                  className="bg-blue-600 text-white px-8 py-4 text-lg hover:bg-blue-700"
                  onClick={() => navigate("/signup?role=candidate")}
                >
                  Start as Candidate
                </Button>
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-600 px-8 py-4 text-lg hover:bg-blue-50"
                  onClick={() => navigate("/signup?role=company")}
                >
                  Hire as Company
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 mb-24">
              <img
                src={interviewImg2}
                alt="AI video interview interface"
                className="rounded-l w-full h-auto md-2"
              />
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">
              Smart Interview Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Dynamic Question Generation",
                  desc: "AI-powered questions adapt based on previous answers using LLaMA-3 model",
                },
                {
                  icon: Smile,
                  title: "Emotion & Sentiment Analysis",
                  desc: "Real-time facial emotion and voice sentiment detection",
                },
                {
                  icon: Mic,
                  title: "Real-Time Transcription",
                  desc: "Live speech-to-text conversion with Azure AI",
                },
                {
                  icon: BarChart,
                  title: "Comprehensive Scoring",
                  desc: "Integrated scoring system evaluating answers, emotion, and voice",
                },
                {
                  icon: Clock,
                  title: "Instant Scheduling",
                  desc: "Flexible interview scheduling with calendar integration",
                },
                {
                  icon: Star,
                  title: "Bias-Free Evaluation",
                  desc: "Objective scoring system eliminating human bias",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-xl shadow-lg"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-blue-900 mb-8">
                Intelligent Interview Flow
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">
                      CV Screening
                    </h3>
                    <p className="text-gray-600">
                      AI analysis matches CV with job requirements
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">
                      Dynamic Interview
                    </h3>
                    <p className="text-gray-600">
                      15 adaptive questions with AI-generated follow-ups
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">
                      Real-Time Analysis
                    </h3>
                    <p className="text-gray-600">
                      Continuous emotion and sentiment tracking
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">
                      Instant Results
                    </h3>
                    <p className="text-gray-600">
                      Detailed analytics dashboard for candidates and companies
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-8 rounded-2xl shadow-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Candidate View</h4>
                      <p className="text-sm text-gray-600">
                        Real-time transcription & question editing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <BarChart className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Live Analytics</h4>
                      <p className="text-sm text-gray-600">
                        Performance metrics during interview
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">AI Assistance</h4>
                      <p className="text-sm text-gray-600">
                        Smart question suggestions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Hiring?
            </h2>
            <p className="text-xl mb-8">
              Join the future of AI-driven recruitment today
            </p>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-white text-blue-600 px-12 py-4 hover:bg-blue-50"
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/demo")}
              >
                Live Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-blue-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-8 h-8 text-white" />
                <span className="text-xl font-bold">AI-VIS</span>
              </div>
              <p className="text-sm text-blue-200">
                Innovating recruitment through AI-powered video interviews
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Candidates</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <a href="#" className="hover:text-white">
                    Find Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Interview Prep
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Profile Settings
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Companies</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <a href="#" className="hover:text-white">
                    Post Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Candidate Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Team Management
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-12 pt-8 text-center text-sm text-blue-300">
            © 2024 AI-VIS. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }
