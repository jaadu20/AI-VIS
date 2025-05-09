import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Users,
  Target,
  Award,
  TrendingUp,
  Briefcase,
  Globe,
  Star,
  CheckCircle,
  ChevronRight,
  Mail,
  Clock,
  Heart,
  Shield,
  Zap,
  Wrench,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import teamImg from "../assets/public/images/team.png";
import officeImg from "../assets/public/images/office.png";
import { useEffect } from "react";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function About() {
  const navigate = useNavigate();
  {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, []);
  }
  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {/* Header - Reusing from Home */}
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
            {["Home", "About Us", "Pricing", "Contact Us"].map(
              (label, i) => (
                <motion.button
                  key={i}
                  onClick={() =>
                    navigate(
                      label === "Home"
                        ? "/"
                        : label === "About Us"
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

      {/* Hero Section with Company Vision */}
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

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            transition={{ duration: 0.6 }}
            className="space-y-8 max-w-3xl mx-auto"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-2">
              Our Story
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
            >
              Revolutionizing
              <span className="block text-blue-700 mt-2">
                Recruitment Through AI
              </span>
            </motion.h1>
            <p className="text-xl text-gray-600 mx-auto">
              Founded in 2021, AI-VIS is on a mission to transform the hiring
              process with advanced artificial intelligence and machine learning
              technologies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl opacity-30 blur-lg"></div>
              <img
                src={officeImg}
                alt="AI-VIS Office Space"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg">
                <Target className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={sectionVariants}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-blue-900">
                Connecting Talent with Opportunity Through Technology
              </h2>
              <p className="text-lg text-gray-600">
                At AI-VIS, we believe that traditional recruitment methods often
                miss the true potential in candidates. Our mission is to create
                a more efficient, fair, and accurate hiring process that
                benefits both employers and job seekers.
              </p>
              <div className="space-y-6">
                {[
                  {
                    icon: Target,
                    title: "Eliminate Hiring Bias",
                    desc: "Our AI-based system evaluates candidates on merit alone, removing unconscious biases from the recruitment process.",
                  },
                  {
                    icon: Clock,
                    title: "Reduce Time-to-Hire",
                    desc: "Automate the initial screening process to save recruiters time and help companies secure top talent faster.",
                  },
                  {
                    icon: Heart,
                    title: "Improve Candidate Experience",
                    desc: "Create a seamless, respectful interview process that allows candidates to showcase their true abilities.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg h-fit">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Our Values
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              Principles That Drive Us
            </motion.h2>
            <p className="text-gray-600 text-lg">
              These core values guide everything we do at AI-VIS, from product
              development to customer service.
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
                icon: Shield,
                title: "Ethical AI",
                desc: "We develop our technology with strict ethical guidelines to ensure fairness and transparency.",
                color: "blue",
              },
              {
                icon: Users,
                title: "Human-Centered",
                desc: "Technology should enhance human capabilities, not replace the human element in hiring.",
                color: "green",
              },
              {
                icon: Globe,
                title: "Inclusivity",
                desc: "We're committed to creating tools that expand opportunities for diverse talent globally.",
                color: "purple",
              },
              {
                icon: Zap,
                title: "Innovation",
                desc: "We continuously push the boundaries of what's possible in recruitment technology.",
                color: "orange",
              },
              {
                icon: Target,
                title: "Accuracy",
                desc: "Our solutions are built to deliver precise, data-driven insights for better hiring decisions.",
                color: "red",
              },
              {
                icon: Wrench,
                title: "Adaptability",
                desc: "We design flexible tools that evolve with the changing needs of the job market.",
                color: "indigo",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={sectionVariants}
                whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 bg-${value.color}-100 rounded-2xl flex items-center justify-center mb-6`}
                >
                  <value.icon className={`w-7 h-7 text-${value.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Our Journey
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              From Idea to Industry Leader
            </motion.h2>
            <p className="text-gray-600 text-lg">
              The story of AI-VIS is one of continuous innovation and growth.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-100"></div>

            <div className="space-y-24">
              {[
                {
                  year: "2021",
                  title: "Foundation",
                  desc: "AI-VIS was founded by a team of AI researchers, HR professionals, and recruitment experts with a shared vision of transforming the interview process.",
                  highlight: "Secured $3M in seed funding",
                },
                {
                  year: "2022",
                  title: "Product Launch",
                  desc: "After intensive development and testing, we launched our first AI video interview platform, supporting basic candidate assessment for small to medium businesses.",
                  highlight: "Onboarded our first 100 customers",
                },
                {
                  year: "2023",
                  title: "Growth & Expansion",
                  desc: "Expanded our team and capabilities, adding advanced sentiment analysis, multilingual support, and comprehensive analytics dashboards.",
                  highlight: "Reached 10,000 interviews processed monthly",
                },
                {
                  year: "2024",
                  title: "Enterprise Solutions",
                  desc: "Introduced enterprise-grade solutions with custom integrations, advanced security features, and dedicated support teams for larger organizations.",
                  highlight: "Partnered with Fortune 500 companies",
                },
                {
                  year: "2025",
                  title: "Global Impact",
                  desc: "Today, AI-VIS serves clients in over 30 countries, helping companies of all sizes find their ideal candidates through our state-of-the-art platform.",
                  highlight: "500,000+ interviews facilitated",
                },
              ].map((milestone, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center gap-8`}
                >
                  <div
                    className={`md:w-1/2 ${
                      i % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-blue-600 text-white font-medium text-sm mb-4">
                      {milestone.year}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{milestone.desc}</p>
                    <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
                      <Star className="w-5 h-5" />
                      <span>{milestone.highlight}</span>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200">
                      {i + 1}
                    </div>
                  </div>

                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Our Team
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              Meet The Leadership
            </motion.h2>
            <p className="text-gray-600 text-lg">
              Our diverse team brings expertise from AI research, human
              resources, recruitment, and technology sectors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-20">
            {[
              // // {
              // //   name: "Dr. Emma Chen",
              // //   role: "CEO & Co-Founder",
              // //   bio: "Former AI Research Lead at Google with Ph.D. in Computer Science from MIT. Expert in machine learning and natural language processing.",
              // //   specialty: "AI Research"
              // // },
              // // {
              // //   name: "Michael Rodriguez",
              // //   role: "CTO & Co-Founder",
              // //   bio: "20+ years experience building scalable tech solutions. Previously led engineering teams at LinkedIn and Oracle.",
              // //   specialty: "Software Engineering"
              // // },
              // // {
              // //   name: "Sarah Johnson",
              // //   role: "Chief HR Officer",
              // //   bio: "Former Global HR Director with 15 years experience in talent acquisition and development across multinational companies.",
              // //   specialty: "Talent Acquisition"
              // // },
              // // {
              // //   name: "David Kim",
              // //   role: "Chief Product Officer",
              // //   bio: "Product strategist with experience at leading tech companies. Passionate about creating intuitive user experiences.",
              // //   specialty: "UX Design"
              // // },
              // {
              //   name: "Priya Patel",
              //   role: "VP of Marketing",
              //   bio: "Digital marketing expert who has led campaigns for Fortune 500 companies and tech startups alike.",
              //   specialty: "Digital Marketing"
              // },
              {
                name: "Muhammad Jawad",
                role: "Co-Founder & CEO",
                bio: "AI and machine learning expert with a passion for transforming recruitment through technology.",
                specialty: "Enterprise Sales",
              },
              {
                name: "Zainab Jabbar",
                role: "Director of Customer Success",
                bio: "Customer experience specialist focused on helping organizations maximize the value of their AI investments.",
                specialty: "NLP",
              },
              {
                name: "Muarij Shakeel",
                role: "Director of Research",
                bio: "Expertise in sentiment analysis and emotion recognition algorithms.",
                specialty: "Customer Experience",
              },
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-2xl font-bold">
                    {member.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mb-3">
                    {member.specialty}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Our Impact
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              AI-VIS by the Numbers
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                metric: "500K+",
                label: "Interviews Conducted",
                icon: Video,
              },
              {
                metric: "2,000+",
                label: "Corporate Clients",
                icon: Briefcase,
              },
              {
                metric: "30+",
                label: "Countries Served",
                icon: Globe,
              },
              {
                metric: "60%",
                label: "Reduction in Hiring Time",
                icon: Clock,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-4xl font-bold text-blue-700 mb-2">
                  {stat.metric}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={sectionVariants}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                Join Our Team
              </div>
              <h2 className="text-4xl font-bold text-blue-900">
                Grow Your Career with AI-VIS
              </h2>
              <p className="text-lg text-gray-600">
                We're always looking for talented individuals who are passionate
                about transforming the recruitment industry through technology.
                Join our diverse team and help shape the future of hiring.
              </p>
              <div className="space-y-6">
                {[
                  "Competitive compensation and benefits",
                  "Remote-first work environment",
                  "Professional development opportunities",
                  "Collaborative and innovative culture",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
              <Button
                className="bg-blue-600 text-white px-8 py-3 hover:bg-blue-700 shadow-lg shadow-blue-200/50"
                onClick={() => navigate("/careers")}
              >
                View Open Positions
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl opacity-30 blur-lg"></div>
              <img
                src={teamImg}
                alt="AI-VIS Team"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4 text-center"
        >
          <h2 className="text-4xl font-bold mb-6">
            Want to Learn More About AI-VIS?
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Our team is ready to answer your questions and show you how AI-VIS
            can transform your recruitment process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-xl mx-auto">
            <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
              <Button
                className="bg-white text-blue-600 px-8 py-4 w-full text-lg font-medium hover:bg-blue-50 shadow-lg"
                onClick={() => navigate("/contact")}
              >
                Contact Sales
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-4 w-full text-lg font-medium"
                onClick={() => navigate("/demo")}
              >
                Request Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Newsletter - Reusing from Home */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 shadow-md">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Stay Updated with AI Recruitment Trends
                </h3>
                <p className="text-gray-600 mb-4">
                  Subscribe to our newsletter for the latest industry insights,
                  product updates, and hiring tips.
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

      {/* Footer - Reusing from Home */}
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
                Transforming the recruitment landscape with AI-powered video
                interviews that identify the best talent quickly and accurately.
              </p>
              <div className="flex gap-4">
                {["Twitter", "LinkedIn", "Facebook", "YouTube"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <span className="text-xs">{social[0]}</span>
                    </a>
                  )
                )}
              </div>
            </div>
            <div className="md:col-span-3 grid grid-cols-2 gap-8">
              {["Company", "Resources", "Support", "Legal"].map(
                (section, i) => (
                  <div key={i} className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-200">
                      {section}
                    </h4>
                    <ul className="space-y-2 text-gray-400">
                      {["About Us", "Careers", "Blog", "Contact Us"].map(
                        (item, j) => (
                          <li key={j}>
                            <a
                              href="#"
                              className="hover:text-white transition-colors"
                            >
                              {item}
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; 2023 AI-VIS. All rights reserved.</p>
            <p className="mt-2">Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default About;
