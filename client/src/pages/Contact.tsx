import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Video,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle,
  ChevronRight,
  Clock,
  ArrowRight,
  Headphones,
  AtSign,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useEffect } from "react";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function Contact() {
  const navigate = useNavigate();

  {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, []);
  }

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

      {/* Hero Section */}
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
              Get in Touch
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              We'd Love to
              <span className="block text-blue-700 mt-2">Hear From You</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Have questions about AI-VIS or need assistance with your account?
              Our team is ready to help you make the most of our AI-powered
              interview platform.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email Us</p>
                  <p className="text-gray-800 font-medium">
                    support@ai-vis.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Call Us</p>
                  <p className="text-gray-800 font-medium">+1 (800) 234-5678</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Visit Us</p>
                  <p className="text-gray-800 font-medium">
                    123 Tech Park, San Francisco, CA
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:w-1/2 relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur opacity-30"></div>
            <div className="relative bg-white p-6 rounded-xl shadow-2xl">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                Send Us a Message
              </h3>

              <form className="space-y-5">
                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="name"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="email"
                  >
                    Your Email
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="subject"
                  >
                    Subject
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="subject"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="message"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                </div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2">
                    Send Message
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>

                <p className="text-center text-sm text-gray-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                  We typically respond within 24 hours
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Frequently Asked Questions
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              Common Questions
            </motion.h2>
            <p className="text-gray-600 text-lg">
              Find quick answers to the most common questions about our
              AI-powered video interview platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "How does the AI analyze interview responses?",
                answer:
                  "Our AI uses natural language processing and machine learning to analyze verbal responses, facial expressions, and voice tone to provide comprehensive candidate assessment based on job-specific criteria.",
              },
              {
                question: "Is my data secure on your platform?",
                answer:
                  "Absolutely. We implement bank-level encryption, strict access controls, and comply with GDPR, CCPA, and other privacy regulations to ensure your data is always protected.",
              },
              {
                question: "How long does it take to set up an interview?",
                answer:
                  "You can set up a complete interview in less than 10 minutes. Our intuitive interface guides you through job requirement definition, question selection, and candidate invitation.",
              },
              {
                question: "Can I customize the interview questions?",
                answer:
                  "Yes, you can fully customize the question bank or use our AI-recommended questions based on the job description. You can also set specific criteria for the AI to evaluate candidates.",
              },
              {
                question: "Do candidates need special software?",
                answer:
                  "No, candidates only need a web browser and a webcam. Our platform is browser-based with no downloads required, making it accessible for candidates worldwide.",
              },
              {
                question: "How do you prevent AI bias in evaluations?",
                answer:
                  "Our AI is regularly tested and updated to mitigate bias. We focus on job-relevant skills and behaviors, not demographic factors, and provide transparency in our evaluation criteria.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                onClick={() => navigate("/support")}
                className="text-blue-600 border-blue-600 px-6 py-3 text-lg hover:bg-blue-50 inline-flex items-center"
              >
                View All FAQs
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support channels */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Support Channels
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-bold mb-6 text-blue-900"
            >
              We're Here For You
            </motion.h2>
            <p className="text-gray-600 text-lg">
              Choose the support option that works best for you. Our team is
              ready to assist with any questions or issues.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Headphones,
                title: "24/7 Customer Support",
                desc: "Our dedicated support team is available around the clock to help with any urgent issues or questions.",
                button: "Contact Support",
                url: "/support",
              },
              {
                icon: MessageSquare,
                title: "Live Chat Assistance",
                desc: "Get real-time help from our product specialists through our in-app chat during business hours.",
                button: "Start Chat",
                url: "/chat",
              },
              {
                icon: Clock,
                title: "Schedule a Demo",
                desc: "Book a personalized demo with our product experts to see how AI-VIS can transform your hiring process.",
                button: "Book Demo",
                url: "/demo",
              },
            ].map((channel, index) => (
              <motion.div
                key={index}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <channel.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {channel.title}
                </h3>
                <p className="text-gray-600 mb-6">{channel.desc}</p>
                <Button
                  variant="outline"
                  onClick={() => navigate(channel.url)}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 inline-flex items-center"
                >
                  {channel.button}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of companies using AI-VIS to find top talent
            efficiently and accurately.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-xl mx-auto">
            <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
              <Button
                className="bg-white text-blue-600 px-6 py-3 w-full text-lg font-medium hover:bg-blue-50 shadow-lg"
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>
            </motion.div>
          </div>
          <div className="mt-4 text-sm text-blue-100 flex justify-center items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>No credit card required for trial</span>
          </div>
        </motion.div>
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
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Enterprise", "Security", "API"],
              },
              {
                title: "Resources",
                links: [
                  "Documentation",
                  "Guides",
                  "Webinars",
                  "Blog",
                  "Case Studies",
                ],
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
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
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
              © 2025 AI-VIS. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-white">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Add a style tag for the grid pattern */}
      <style>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
}

export default Contact;
