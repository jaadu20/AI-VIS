import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check,
  CheckCircle,
  ChevronRight,
  Video,
  Shield,
  Star,
  MessageSquare,
  Database,
  Briefcase,
  Building,
  Settings,
  HelpCircle,
  PieChart,
  Zap,
  Quote,
} from "lucide-react";
import { Button } from "../components/ui/Button";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.1)" },
};

export function Pricing() {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Starter",
      price: "149",
      description:
        "Perfect for small businesses starting with AI-powered interviews",
      features: [
        "Up to 15 job postings per month",
        "25 AI video interviews per month",
        "Basic candidate analytics",
        "Standard question templates",
        "Email support",
        "7-day data retention",
        "1 HR admin account",
      ],
      color: "blue",
      popular: false,
      ctaText: "Start Free Trial",
    },
    {
      name: "Professional",
      price: "349",
      description: "Ideal for growing companies with regular hiring needs",
      features: [
        "Up to 50 job postings per month",
        "100 AI video interviews per month",
        "Advanced candidate analytics",
        "Custom question builder",
        "Priority email & chat support",
        "30-day data retention",
        "3 HR admin accounts",
        "AI talent matching",
        "Automated skill assessment",
        "Integration with ATS systems",
      ],
      color: "blue",
      popular: true,
      ctaText: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      description:
        "Comprehensive solution for large organizations with high-volume hiring",
      features: [
        "Unlimited job postings",
        "Unlimited AI video interviews",
        "Enterprise analytics dashboard",
        "Advanced bias detection & fairness tools",
        "Custom interview workflows",
        "Dedicated customer success manager",
        "99.99% uptime SLA",
        "Advanced data security",
        "90-day data retention",
        "Unlimited HR admin accounts",
        "White-labeling options",
        "API access",
      ],
      color: "blue",
      popular: false,
      ctaText: "Contact Sales",
    },
  ];

  const faqs = [
    {
      question: "How does the free trial work?",
      answer:
        "Our 14-day free trial gives you full access to all features of the Professional plan. No credit card is required to start, and you can cancel anytime. At the end of your trial, you can select a plan that fits your needs or continue with our free basic features.",
    },
    {
      question: "Can I change plans later?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to the new features and be billed the prorated difference. When downgrading, the changes will take effect at the start of your next billing cycle.",
    },
    {
      question: "Is there a limit on how many candidates I can interview?",
      answer:
        "Each plan includes a specific number of AI video interviews per month. The Starter plan includes 25 interviews, Professional includes 100 interviews, and Enterprise offers unlimited interviews. Additional interviews can be purchased if needed.",
    },
    {
      question: "How secure is the platform?",
      answer:
        "AI-VIS is built with enterprise-grade security. We use encryption for all data in transit and at rest, implement strict access controls, and comply with GDPR, CCPA, and other relevant privacy regulations. Our Enterprise plan offers additional security features for organizations with higher compliance needs.",
    },
    {
      question: "Can I integrate AI-VIS with our existing ATS or HRIS?",
      answer:
        "Yes, our Professional and Enterprise plans support integration with major ATS providers including Workday, Greenhouse, Lever, and more. Our Enterprise plan also includes custom API access for specialized integrations with your existing HR systems.",
    },
    {
      question: "Do you offer custom pricing for high-volume hiring?",
      answer:
        "Yes, we offer custom pricing for organizations with high-volume hiring needs. Our Enterprise plan is tailored to your specific requirements, and our sales team can work with you to create a package that aligns with your recruitment volume and budget.",
    },
  ];

  const testimonials = [
    {
      quote:
        "AI-VIS has reduced our time-to-hire by 67% while improving candidate quality. The ROI on this platform has been incredible for our company.",
      name: "Jennifer Murphy",
      title: "Head of Talent Acquisition",
      company: "TechGrowth Inc.",
      rating: 5,
    },
    {
      quote:
        "The AI-powered interviews helped us eliminate bias and find better cultural fits. Our hiring manager satisfaction scores increased by 40% since implementation.",
      name: "Michael Chen",
      title: "HR Director",
      company: "FutureTech Corp",
      rating: 5,
    },
    {
      quote:
        "Switching to AI-VIS was the best decision we made for our high-volume hiring. The platform scales effortlessly with our growing recruitment needs.",
      name: "Sarah Johnson",
      title: "Global Talent Lead",
      company: "InnovateX Solutions",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {/* Header */}
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
                onClick={() => navigate("/login")}
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
      <section className="pt-36 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
          >
            Simple, Transparent Pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Find Top Talent with{" "}
            <span className="text-blue-600">AI-Powered</span> Video Interviews
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Choose a plan that fits your hiring needs. Scale your recruitment
            process with our intelligent video interview platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <div className="bg-blue-50 px-5 py-2 rounded-full flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-700">14-day free trial</span>
            </div>
            <div className="bg-blue-50 px-5 py-2 rounded-full flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-700">No credit card required</span>
            </div>
            <div className="bg-blue-50 px-5 py-2 rounded-full flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-700">Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-4 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                variants={cardVariants}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`relative bg-white border ${
                  plan.popular ? "border-blue-400" : "border-gray-200"
                } rounded-2xl shadow-xl overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? "bg-blue-50" : ""}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-500 ml-2">/month</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <motion.div whileHover={{ scale: 1.03 }}>
                    <Button
                      className={`w-full py-3 ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white shadow-md`}
                      onClick={() =>
                        navigate(
                          plan.name === "Enterprise" ? "/contact" : "/signup"
                        )
                      }
                    >
                      {plan.ctaText}
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </motion.div>
                </div>

                <div className="p-8 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              All Plans Include
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              Core Features Available in Every Plan
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All AI-VIS plans come with powerful features to transform your
              hiring process, no matter your company size.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Briefcase,
                title: "Job Posting Dashboard",
                desc: "Create and manage all your job openings in one centralized location",
              },
              {
                icon: Video,
                title: "AI Video Interviews",
                desc: "Conduct asynchronous interviews with dynamic AI-generated questions",
              },
              {
                icon: Database,
                title: "Candidate Database",
                desc: "Store and search candidate profiles with AI-powered filtering",
              },
              {
                icon: PieChart,
                title: "Analytics Dashboard",
                desc: "View hiring metrics and recruitment performance statistics",
              },
              {
                icon: Settings,
                title: "Interview Customization",
                desc: "Tailor interview experiences to specific job requirements",
              },
              {
                icon: Shield,
                title: "Advanced Security",
                desc: "Enterprise-grade data protection and privacy compliance",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={sectionVariants}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Plan Comparison
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              Find The Perfect Plan For Your Business
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="overflow-x-auto rounded-xl shadow-lg border border-gray-200"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-6 py-4 text-left text-gray-900 font-semibold">
                    Features
                  </th>
                  <th className="px-6 py-4 text-center text-gray-900 font-semibold">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center text-blue-700 font-semibold relative">
                    Professional
                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-bl-lg">
                      POPULAR
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center text-gray-900 font-semibold">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Monthly job postings",
                    starter: "15",
                    pro: "50",
                    enterprise: "Unlimited",
                  },
                  {
                    feature: "AI video interviews per month",
                    starter: "25",
                    pro: "100",
                    enterprise: "Unlimited",
                  },
                  {
                    feature: "Data retention period",
                    starter: "7 days",
                    pro: "30 days",
                    enterprise: "90 days",
                  },
                  {
                    feature: "HR admin accounts",
                    starter: "1",
                    pro: "3",
                    enterprise: "Unlimited",
                  },
                  {
                    feature: "AI talent matching",
                    starter: "—",
                    pro: "✓",
                    enterprise: "✓",
                  },
                  {
                    feature: "Custom question builder",
                    starter: "—",
                    pro: "✓",
                    enterprise: "✓",
                  },
                  {
                    feature: "Bias detection tools",
                    starter: "—",
                    pro: "Basic",
                    enterprise: "Advanced",
                  },
                  {
                    feature: "ATS integration",
                    starter: "—",
                    pro: "✓",
                    enterprise: "✓",
                  },
                  {
                    feature: "White-labeling",
                    starter: "—",
                    pro: "—",
                    enterprise: "✓",
                  },
                  {
                    feature: "API access",
                    starter: "—",
                    pro: "—",
                    enterprise: "✓",
                  },
                  {
                    feature: "Dedicated support",
                    starter: "—",
                    pro: "—",
                    enterprise: "✓",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {row.starter}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 bg-blue-50/50">
                      {row.pro}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    Monthly price
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 font-semibold">
                    $149
                  </td>
                  <td className="px-6 py-4 text-center text-blue-700 font-semibold bg-blue-50/50">
                    $349
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 font-semibold">
                    Custom
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-6"></td>
                  <td className="px-6 py-6 text-center">
                    <Button
                      onClick={() => navigate("/signup")}
                      className="bg-gray-800 text-white hover:bg-gray-700 px-5 py-2"
                    >
                      Start Free Trial
                    </Button>
                  </td>
                  <td className="px-6 py-6 text-center bg-blue-50/50">
                    <Button
                      onClick={() => navigate("/signup")}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 shadow-md shadow-blue-100"
                    >
                      Start Free Trial
                    </Button>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <Button
                      onClick={() => navigate("/contact")}
                      className="bg-gray-800 text-white hover:bg-gray-700 px-5 py-2"
                    >
                      Contact Sales
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4"
            >
              Customer Success Stories
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              Trusted by Industry Leaders
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                variants={sectionVariants}
                transition={{ delay: idx * 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-blue-600 rotate-180" />
                </div>
                <p className="text-gray-600 mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                    <p className="text-sm text-blue-600">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              onClick={() => navigate("/case-studies")}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              View All Case Studies
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
            Join thousands of companies using AI-VIS to find top talent
            efficiently and accurately. Start your free trial today with no
            commitment.
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">AI-VIS</span>
            </div>
            <p className="text-gray-400 text-sm">
              Revolutionizing hiring through AI-powered video interview
              solutions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {["Features", "Pricing", "Case Studies", "Security"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() =>
                        navigate(`/${item.toLowerCase().replace(" ", "-")}`)
                      }
                      className="hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {["About Us", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() =>
                      navigate(`/${item.toLowerCase().replace(" ", "-")}`)
                    }
                    className="hover:text-blue-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() =>
                        navigate(`/${item.toLowerCase().replace(" ", "-")}`)
                      }
                      className="hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© 2024 AI-VIS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
