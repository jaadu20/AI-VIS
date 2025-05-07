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
  CheckCircle,
  ChevronRight,
  Mail,
  Zap,
  Shield,
  Award
} from "lucide-react";
import { Button } from "../components/ui/Button";
import interviewImg2 from "../assets/public/images/home2.png";
import wavePattern from "../assets/public/images/blue.jpg";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
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
            {["Features", "How It Works", "Pricing", "Enterprise"].map((label, i) => (
              <motion.button
                key={i}
                onClick={() =>
                  navigate(label === "Features" ? "/features" : 
                          label === "How It Works" ? "/how-it-works" : 
                          label === "Pricing" ? "/pricing" : "/enterprise")
                }
                className="text-gray-600 hover:text-blue-600 font-medium relative after:block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full hover:after:transition-width after:transition-all"
              >
                {label}
              </motion.button>
            ))}
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/login?role=candidate")}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 shadow-md shadow-blue-200"
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Hero with parallax image and fade-in text */}
      <section
        className="pt-36 pb-24 px-4 bg-fixed bg-center bg-cover relative overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(241, 245, 249, 0.9), rgba(209, 226, 249, 0.95))`,
        }}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-400 opacity-5"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 space-y-8"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-2">
              Next Generation Recruitment
            </div>
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
            >
              AI-Powered
              <span className="block text-blue-700 mt-2">
                Video Interviews
              </span>
            </motion.h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Revolutionize hiring with real-time AI analysis, dynamic questioning, and 
              comprehensive candidate evaluation that saves time and identifies top talent.
            </p>
            
            <div className="flex items-center text-gray-500 text-sm space-x-6">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                <span>14-day free trial</span>
              </div>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  className="bg-blue-700 text-white px-8 py-4 text-lg hover:bg-blue-800 shadow-lg shadow-blue-200/50"
                  onClick={() => navigate("/signup?role=candidate")}
                >
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  variant="outline"
                  className="text-blue-700 border-blue-700 px-8 py-4 text-lg hover:bg-blue-50"
                  onClick={() => navigate("/demo")}
                >
                  Watch Demo
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-blue-${i*100} flex items-center justify-center text-xs text-white font-bold`}>
                    {i}
                  </div>
                ))}
              </div>
              <p className="ml-4 text-sm text-gray-600">
                <span className="font-medium">500+ companies</span> trust AI-VIS for hiring
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:w-1/2 relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur opacity-30"></div>
            <div className="relative bg-white p-2 rounded-xl shadow-2xl">
              <img
                src={interviewImg2}
                alt="AI video interview interface"
                className="rounded-lg w-full h-auto shadow-sm"
              />
              <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-3 rounded-full shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-8 text-sm font-medium uppercase tracking-wide">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["Microsoft", "Google", "Amazon", "IBM", "Oracle"].map((company) => (
              <div key={company} className="text-gray-400 font-bold text-xl">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features with staggered animation */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Intelligent Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              Engineered for Hiring Excellence
            </motion.h2>
            <p className="text-gray-600 text-lg">
              Our AI-powered platform combines cutting-edge technology with intuitive design 
              to deliver the most effective video interview experience.
            </p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Brain,
                title: "Dynamic Question Generation",
                desc: "AI-powered questions adapt based on previous answers using advanced LLaMA-3 model",
                color: "blue",
              },
              {
                icon: Smile,
                title: "Emotion & Sentiment Analysis",
                desc: "Real-time facial emotion and voice sentiment detection for comprehensive candidate assessment",
                color: "green",
              },
              {
                icon: Mic,
                title: "Advanced Transcription",
                desc: "Live speech-to-text conversion with Azure AI for accurate interview documentation",
                color: "indigo",
              },
              {
                icon: BarChart,
                title: "Comprehensive Scoring",
                desc: "Integrated scoring system evaluating answers, emotional intelligence, and communication skills",
                color: "purple",
              },
              {
                icon: Clock,
                title: "Intelligent Scheduling",
                desc: "Flexible interview scheduling with calendar integration and time zone management",
                color: "orange",
              },
              {
                icon: Shield,
                title: "Bias-Free Evaluation",
                desc: "Objective scoring system eliminating human bias for fair candidate assessment",
                color: "red",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={sectionVariants}
                whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works with fade-in sections */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              The Process
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              Intelligent Interview Flow
            </motion.h2>
            <p className="text-gray-600 text-lg">
              Our streamlined process combines AI technology with human-centered design
              to deliver exceptional interview experiences.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={sectionVariants}
              className="space-y-12"
            >
              {[
                {
                  step: 1,
                  title: "CV Analysis & Job Matching",
                  desc: "AI analysis identifies key qualifications and matches CV with job requirements for personalized interviews",
                  icon: User,
                },
                {
                  step: 2,
                  title: "Dynamic Interview Session",
                  desc: "15 adaptive questions with AI-generated follow-ups based on candidate responses and job specifications",
                  icon: Video,
                },
                {
                  step: 3,
                  title: "Real-Time Performance Analysis",
                  desc: "Continuous emotion and sentiment tracking with advanced algorithms for comprehensive assessment",
                  icon: Brain,
                },
                {
                  step: 4,
                  title: "Comprehensive Results & Insights",
                  desc: "Detailed analytics dashboard for candidates and companies with actionable recommendations",
                  icon: BarChart,
                },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  className="flex gap-6"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-200">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-5 h-5 text-blue-500" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl opacity-30 blur-lg"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 p-8 rounded-2xl shadow-2xl">
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <h3 className="font-bold text-blue-900">Interview Session</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                
                  {[
                    {
                      icon: User,
                      title: "Advanced Candidate View",
                      desc: "Real-time transcription & feedback during interview",
                    },
                    {
                      icon: BarChart,
                      title: "Live Analytics Dashboard",
                      desc: "Performance metrics tracking with instant visualization",
                    },
                    {
                      icon: Brain,
                      title: "AI Communication Assistant",
                      desc: "Smart question suggestions and response analysis",
                    },
                    {
                      icon: Award,
                      title: "Skill Assessment",
                      desc: "Automated evaluation of technical and soft skills",
                    }
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-300 group"
                    >
                      <div className="p-2 bg-white rounded-lg group-hover:bg-blue-600 transition-colors">
                        <card.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{card.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Success Stories
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              What Our Clients Say
            </motion.h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "HR Director, TechCorp",
                quote: "AI-VIS has reduced our hiring time by 60% while improving the quality of our hires significantly. The AI analytics provide insights we never had before.",
              },
              {
                name: "Michael Chang",
                role: "CEO, StartUp Innovations",
                quote: "As a growing startup, we needed to scale our hiring process efficiently. AI-VIS delivered beyond our expectations with its intelligent analysis and bias-free evaluations.",
              },
              {
                name: "Jessica Williams",
                role: "Recruitment Manager, Global Solutions",
                quote: "The dynamic questioning system adapts perfectly to each candidate, revealing capabilities that traditional interviews would miss. It's transformed our approach to talent acquisition.",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-md border border-gray-100"
              >
                <div className="text-blue-500 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 inline-block fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                    {testimonial.name.split(' ').map(name => name[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4 text-center"
        >
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Join thousands of companies using AI-VIS to find top talent efficiently and accurately. 
            Start your free trial today with no commitment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-xl mx-auto">
            <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
              <Button
                className="bg-white text-blue-600 px-8 py-4 w-full text-lg font-medium hover:bg-blue-50 shadow-lg"
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-4 w-full text-lg font-medium"
                onClick={() => navigate("/demo")}
              >
                Schedule Demo
              </Button>
            </motion.div>
          </div>
          <div className="mt-8 text-sm text-blue-100 flex justify-center items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>No credit card required for trial</span>
          </div>
        </motion.div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 shadow-md">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Stay Updated with AI Recruitment Trends
                </h3>
                <p className="text-gray-600 mb-4">
                  Subscribe to our newsletter for the latest industry insights, product updates, and hiring tips.
                </p>
              </div>
              <div className="md:w-1/2 w-full">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="px-4 py-3 rounded-lg border border-gray-300 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button className="bg-blue-600 text-white py-3 px-6 whitespace-nowrap hover:bg-blue-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-gray-900 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AI-VIS</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-md">
                Transforming the recruitment landscape with AI-powered video interviews that identify the best talent quickly and accurately.
              </p>
              <div className="flex gap-4">
                {["Twitter", "LinkedIn", "Facebook", "YouTube"].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <span className="text-xs">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Enterprise", "Security", "API"],
              },
              {
                title: "Resources",
                links: ["Documentation", "Guides", "Webinars", "Blog", "Case Studies"],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Contact", "Partners"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-lg mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 AI-VIS. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </motion.footer>
      
      {/* Add a style tag for the grid pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
}