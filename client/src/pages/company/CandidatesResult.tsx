import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Search, 
  Filter, 
  Download, 
  ArrowLeft, 
  Star, 
  Award,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileText,
  Briefcase,
  UserCheck,
  Clock,
  SlidersHorizontal
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ScoreBadge = ({ score }: { score: string }) => {
  // Convert score to number and determine badge color
  const scoreNum = parseInt(score);
  let badgeClass = "";
  
  if (scoreNum >= 90) {
    badgeClass = "bg-green-100 text-green-800";
  } else if (scoreNum >= 75) {
    badgeClass = "bg-blue-100 text-blue-800";
  } else if (scoreNum >= 60) {
    badgeClass = "bg-yellow-100 text-yellow-800";
  } else {
    badgeClass = "bg-red-100 text-red-800";
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
      {score}
    </span>
  );
};

export function CandidatesResult() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScore, setFilterScore] = useState("all");
  const [filterPosition, setFilterPosition] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Mock candidate results data
  const candidatesData = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      position: "Senior Frontend Developer",
      score: "85%",
      strengths: ["React", "JavaScript", "TypeScript", "CSS", "Redux"],
      weaknesses: ["Testing", "Accessibility"],
      feedback: "Strong technical skills with deep React knowledge. Shows excellent problem-solving abilities and code organization. Needs improvement in unit testing and accessibility practices.",
      interview_date: "2025-04-28",
      status: "Shortlisted",
      photo: "/api/placeholder/80/80",
      skills_scores: {
        "Technical": 88,
        "Communication": 82,
        "Problem Solving": 90,
        "Team Collaboration": 78
      },
      interviewer_notes: "Candidate demonstrated strong problem-solving skills during the technical assessment. Code quality was excellent with proper architecture considerations."
    },
  ];
  
  const [candidates, setCandidates] = useState(candidatesData);
  
  // Simulating API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCandidates(candidatesData);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter and sort candidates
  useEffect(() => {
    let filteredResults = [...candidatesData];
    
    // Apply search filter
    if (searchTerm) {
      filteredResults = filteredResults.filter(
        candidate => 
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply score filter
    if (filterScore !== "all") {
      filteredResults = filteredResults.filter(candidate => {
        const score = parseInt(candidate.score);
        if (filterScore === "90+") return score >= 90;
        if (filterScore === "80-89") return score >= 80 && score < 90;
        if (filterScore === "70-79") return score >= 70 && score < 80;
        if (filterScore === "<70") return score < 70;
        return true;
      });
    }
    
    // Apply position filter
    if (filterPosition !== "all") {
      filteredResults = filteredResults.filter(
        candidate => candidate.position === filterPosition
      );
    }
    
    // Apply sorting
    filteredResults.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "score") {
        comparison = parseInt(a.score) - parseInt(b.score);
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "date") {
        comparison = new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime();
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    setCandidates(filteredResults);
  }, [searchTerm, filterScore, filterPosition, sortBy, sortDirection]);
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };
  
  const toggleExpandCandidate = (id: string) => {
    setExpandedCandidate(expandedCandidate === id ? null : id);
  };
  
  const positions = [...new Set(candidatesData.map(candidate => candidate.position))];
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Hired":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status}
        </span>;
      case "Rejected":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          {status}
        </span>;
      case "Shortlisted":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
          <Star className="w-3 h-3 mr-1" />
          {status}
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          {status}
        </span>;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="sticky top-0 bg-white/95 backdrop-blur-md py-4 z-10 border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <User className="w-6 h-6 mr-2 text-blue-700" />
            <h1 className="text-xl font-bold text-black">Candidate Assessment Results</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
         <Button
              variant="outline"
              className="text-gray-500 border-gray-200 hover:bg-gray-50"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => {}}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="py-6 px-6 bg-gray-50 min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Stats Banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <Card className="border-none shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden rounded-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Assessment Overview</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserCheck className="w-8 h-8 text-blue-200 mr-3" />
                      <div>
                        <p className="text-white text-sm">Total Candidates</p>
                        <p className="text-2xl font-bold text-white">{candidatesData.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center">
                      <Award className="w-8 h-8 text-blue-200 mr-3" />
                      <div>
                        <p className="text-white text-sm">Top Score</p>
                        <p className="text-2xl font-bold text-white">
                          {Math.max(...candidatesData.map(c => parseInt(c.score)))}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-blue-200 mr-3" />
                      <div>
                        <p className="text-white text-sm">Hired</p>
                        <p className="text-2xl font-bold text-white">
                          {candidatesData.filter(c => c.status === "Hired").length}
                        </p>
                      </div>
                    </div>
                  </div> */}
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center">
                      <Briefcase className="w-8 h-8 text-blue-200 mr-3" />
                      <div>
                        <p className="text-white text-sm">Open Positions</p>
                        <p className="text-2xl font-bold text-white">
                          {new Set(candidatesData.map(c => c.position)).size}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="border shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative col-span-2 mt-6">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidates by name, position or email..."
                    className="pl-10 block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Score Filter */}
                <div>
                  <div className="flex items-center mb-1">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500 mr-1" />
                    <label className="text-sm text-gray-600">Score Range</label>
                  </div>
                  <label htmlFor="scoreFilter" className="sr-only">Score Range</label>
                  <select
                    id="scoreFilter"
                    className="block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    value={filterScore}
                    onChange={(e) => setFilterScore(e.target.value)}
                  >
                    <option value="all">All Scores</option>
                    <option value="90+">90% and above</option>
                    <option value="80-89">80% - 89%</option>
                    <option value="70-79">70% - 79%</option>
                    <option value="<70">Below 70%</option>
                  </select>
                </div>
                
                {/* Position Filter */}
                <div>
                  <div className="flex items-center mb-1">
                    <Briefcase className="w-4 h-4 text-gray-500 mr-1" />
                    <label className="text-sm text-gray-600">Position</label>
                  </div>
                  <label htmlFor="positionFilter" className="sr-only">Position</label>
                  <select
                    id="positionFilter"
                    className="block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                  >
                    <option value="all">All Positions</option>
                    {positions.map((position, index) => (
                      <option key={index} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                {/* Sort Options */}
                <div>
                  <div className="flex items-center mb-1">
                    <Filter className="w-4 h-4 text-gray-500 mr-1" />
                    <label className="text-sm text-gray-600">Sort By</label>
                  </div>
                  <div className="flex">
                    <label htmlFor="sortBy" className="sr-only">Sort By</label>
                    <select
                      id="sortBy"
                      className="block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="score">Score</option>
                      <option value="name">Name</option>
                      <option value="date">Interview Date</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Candidates List */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {loading ? (
              // Loading skeleton
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="border animate-pulse p-6">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </Card>
              ))
            ) : candidates.length === 0 ? (
              // No results
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterScore("all");
                    setFilterPosition("all");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              // Candidates list
              candidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border shadow-sm overflow-hidden ${expandedCandidate === candidate.id ? 'ring-2 ring-blue-300' : 'hover:shadow-md'}`}>
                    {/* Candidate summary row */}
                    <div 
                      className="p-4 md:p-6 cursor-pointer"
                      onClick={() => toggleExpandCandidate(candidate.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                          <img 
                            src={candidate.photo} 
                            alt={candidate.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 mr-4"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <span>{candidate.position}</span>
                              <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
                              <span>{candidate.email}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0 md:ml-auto">
                          {getStatusBadge(candidate.status)}
                          <ScoreBadge score={candidate.score} />
                          <div className="flex items-center ml-2">
                            {expandedCandidate === candidate.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    {expandedCandidate === candidate.id && (
                      <div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left column - Feedback & Notes */}
                          <div className="lg:col-span-2 space-y-6">
                            {/* Assessment feedback */}
                            <div>
                              <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                Assessment Feedback
                              </h4>
                              <p className="text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                                {candidate.feedback}
                              </p>
                            </div>
                            
                            {/* Interviewer notes */}
                            <div>
                              <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                Interviewer Notes
                              </h4>
                              <p className="text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                                {candidate.interviewer_notes}
                              </p>
                            </div>
                            
                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  Strengths
                                </h4>
                                <ul className="bg-white p-4 rounded-lg border border-gray-200 space-y-1">
                                  {candidate.strengths.map((strength, idx) => (
                                    <li key={idx} className="flex items-center text-gray-700">
                                      <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                  Areas for Improvement
                                </h4>
                                <ul className="bg-white p-4 rounded-lg border border-gray-200 space-y-1">
                                  {candidate.weaknesses.map((weakness, idx) => (
                                    <li key={idx} className="flex items-center text-gray-700">
                                      <XCircle className="w-3 h-3 mr-2 text-red-500" />
                                      {weakness}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right column - Skills & Actions */}
                          <div className="space-y-6">
                            {/* Skills breakdown */}
                            <div>
                              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                                <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                                Skills Assessment
                              </h4>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                {Object.entries(candidate.skills_scores).map(([skill, score], idx) => (
                                  <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-gray-700">{skill}</span>
                                      <span className="font-medium">{score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${score}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Interview Details */}
                            <div>
                              <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                Interview Details
                              </h4>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                                  <span>Date:</span>
                                  <span className="font-medium">
                                    {new Date(candidate.interview_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-700">
                                  <span>Status:</span>
                                  <span>{getStatusBadge(candidate.status)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="space-y-2">
                              <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {}}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Full Report
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                                onClick={() => {}}
                              >
                                <User className="w-4 h-4 mr-2" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </main>
    </DashboardLayout>
  );
}