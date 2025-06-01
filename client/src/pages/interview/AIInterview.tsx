import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Send,
  Loader2,
  Repeat,
  Mic as MicIcon,
  Square as StopIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Volume2,
  LogOut,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/progress";
import aibot from "../../assets/public/images/aibot.jpg";
import api from "../../api";
import toast from "react-hot-toast";

interface QuestionData {
  text: string;
  difficulty: string;
  is_predefined?: boolean;
}

interface ApplicationData {
  job_title: string;
  company_name: string;
  job_description: string;
}

const popupVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export function AIInterview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);
  const [answer, setAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewId, setInterviewId] = useState<string>("");
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [applicationData, setApplicationData] =
    useState<ApplicationData | null>(null);
  const [currentQuestionScore, setCurrentQuestionScore] = useState<number>(0);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [hasIntroductionPlayed, setHasIntroductionPlayed] = useState(false);

  // Media states
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const [canEditAnswer, setCanEditAnswer] = useState(false);

  // Prevent navigation and tab switching
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showPopup) {
        e.preventDefault();
        e.returnValue =
          "Your interview progress will be lost. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (!showPopup) {
        e.preventDefault();
        window.history.pushState(null, "", window.location.href);
        setConfirmExit(true);
      }
    };

    const handleVisibilityChange = () => {
      if (!showPopup && document.hidden) {
        toast.error("Please stay on this tab during the interview");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F5, Ctrl+R, Ctrl+W, Alt+F4, etc.
      if (
        !showPopup &&
        (e.key === "F5" ||
          (e.ctrlKey && e.key === "r") ||
          (e.ctrlKey && e.key === "w") ||
          (e.altKey && e.key === "F4"))
      ) {
        e.preventDefault();
        toast.error("Navigation is disabled during the interview");
      }
    };

    if (!showPopup) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("keydown", handleKeyDown);
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPopup]);

  // Interview timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!showPopup) {
      timer = setInterval(() => {
        setInterviewDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showPopup]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const fetchApplicationData = async () => {
    try {
      const response = await api.get(`/applications/${applicationId}/`);
      setApplicationData(response.data);
    } catch (error) {
      console.error("Failed to fetch application data:", error);
      toast.error("Failed to load application details");
    }
  };

  const playAudio = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await api.post(
        "/interviews/tts/",
        { text },
        { responseType: "blob" }
      );

      // Create a new Blob from the response data
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        toast.error("Audio playback failed");
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      toast.error("Speech synthesis failed");
    }
  };

  const playIntroduction = async () => {
    // if (!applicationData || hasIntroductionPlayed) return;

    const introductionText = `Welcome to your interview for the position at . This interview will consist of several questions to assess your qualifications and fit for the role. Please take your time to answer each question thoughtfully. Let's begin with the first question.`;

    await playAudio(introductionText);
    setHasIntroductionPlayed(true);

    // Play first question after introduction
    if (questions.length > 0) {
      await playAudio(questions[0].text);
    }
  };

//   const playQuestionAudio = async (questionText: string) => {
//   await playAudio(questionText);
//   setCanEditAnswer(true); // Allow recording after question is played
// };

  // const playIntroduction = async () => {
  //   if (!applicationData || hasIntroductionPlayed) return;

  //   const introductionText = `Welcome to your interview for the ${applicationData.job_title} position at ${applicationData.company_name}. This interview will consist of several questions to assess your qualifications and fit for the role. Please take your time to answer each question thoughtfully. Let's begin with the first question.`;

  //   try {
  //     setIsSpeaking(true);
  //     const response = await api.post(
  //       "/interviews/tts/",
  //       { text: introductionText },
  //       { responseType: "blob" }
  //     );

  //     const audioUrl = URL.createObjectURL(response.data);
  //     const audio = new Audio(audioUrl);

  //     audio.onended = () => {
  //       setIsSpeaking(false);
  //       setHasIntroductionPlayed(true);
  //       // Play first question after introduction
  //       if (questions.length > 0) {
  //         playQuestionAudio(questions[0].text);
  //       }
  //     };

  //     audio.onerror = () => {
  //       setIsSpeaking(false);
  //       setHasIntroductionPlayed(true);
  //       toast.error("Audio playback failed, continuing with text");
  //     };

  //     await audio.play();
  //   } catch (error) {
  //     console.error("TTS error:", error);
  //     setIsSpeaking(false);
  //     setHasIntroductionPlayed(true);
  //     toast.error("Speech synthesis failed, continuing with text");
  //   }
  // };

  const startInterview = async () => {
    setShowPopup(false);
    setIsLoading(true);

    try {
      // Fetch application data first
      await fetchApplicationData();

      // Initialize interview
      const response = await api.post("/interviews/start/", {
        application_id: applicationId,
      });

      if (!response.data?.interview_id) {
        throw new Error("Invalid interview initialization response");
      }

      setInterviewId(response.data.interview_id);
      setQuestions(response.data.questions);

      // Initialize media and play introduction
      await initializeMediaStream();
      setTimeout(() => {
        playIntroduction();
      }, 1000);
    } catch (error) {
      console.error("Interview start error:", error);
      const errMsg =
        (error as any)?.response?.data?.error || "Failed to start interview";
      toast.error(errMsg);
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      setVideoStream(new MediaStream(stream.getVideoTracks()));
      setAudioEnabled(true);
      setCameraEnabled(true);
    } catch (error) {
      console.error("Media initialization failed:", error);
      toast.error("Camera/microphone access required for the interview");
      throw error;
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(console.error);
    }
  }, [videoStream]);

  const playQuestionAudio = async (questionText: string) => {
    try {
      setIsSpeaking(true);
      const response = await api.post(
        "/interviews/tts/",
        { text: questionText },
        { responseType: "blob" }
      );

      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        setCanEditAnswer(true); // Allow recording after question is played
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setCanEditAnswer(true);
        toast.error("Audio playback failed");
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      setCanEditAnswer(true);
    }
  };

  const handleStartRecording = () => {
    if (!mediaStream || !canEditAnswer) {
      toast.error("Please wait for the question to finish playing");
      return;
    }

    const recorder = new MediaRecorder(mediaStream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
      await processRecordedAnswer(audioBlob);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setAnswer(""); // Clear previous answer

    // Start recording timer
    setRecordingDuration(0);
    recordingTimer.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);

      // Stop recording timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }
  };

  const processRecordedAnswer = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);

      // Convert speech to text
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const sttResponse = await api.post("/interviews/stt/", formData);
      const transcribedText = sttResponse.data.text;

      setAnswer(transcribedText);
      setCanEditAnswer(false); // Disable editing after transcription
    } catch (error) {
      console.error("STT error:", error);
      toast.error("Failed to process recorded answer");
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextQuestion = async (score: number) => {
    try {
      let difficulty = "medium";

      // Select difficulty based on score
      if (score >= 8) {
        difficulty = "hard";
      } else if (score >= 5) {
        difficulty = "medium";
      } else {
        difficulty = "easy";
      }

      const response = await api.post("/interviews/generate-question/", {
        job_description: applicationData?.job_description,
        difficulty: difficulty,
        interview_id: interviewId,
        previous_questions: questions.map((q) => q.text),
      });

      return {
        text: response.data.question,
        difficulty: difficulty,
        is_predefined: false,
      };
    } catch (error) {
      console.error("Question generation error:", error);
      // Fallback question
      return {
        text: "Can you describe a challenging project you've worked on and how you overcame obstacles?",
        difficulty: "medium",
        is_predefined: false,
      };
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim() || isProcessingAnswer) return;

    setIsProcessingAnswer(true);
    setIsLoading(true);

    try {
      // Prepare form data with answer and media
      const formData = new FormData();
      formData.append("question", questions[currentQuestionIndex]?.text || "");
      formData.append("answer_text", answer);
      formData.append("question_index", currentQuestionIndex.toString());

      // Add audio if available
      if (recordedChunks.length > 0) {
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
        formData.append("answer_audio", audioBlob);
      }

      // Add video frame for analysis (capture current frame)
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              formData.append("video_frame", blob);
            }
          },
          "image/jpeg",
          0.8
        );
      }

      // Submit answer and get score
      const response = await api.post(
        `/interviews/${interviewId}/submit-answer/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const answerScore = response.data.score || 5; // Default score if not provided
      setCurrentQuestionScore(answerScore);

      // Check if interview is complete (after 15 questions or specific conditions)
      if (currentQuestionIndex >= 14 || response.data.completed) {
        // Interview completed
        navigate(`/interview-result/${interviewId}`);
        return;
      }

      // Generate next question based on score
      let nextQuestion;
      if (currentQuestionIndex === 1) {
        // Third question - first generated question
        nextQuestion = await generateNextQuestion(5); // Start with medium difficulty
      } else {
        // Subsequent questions based on previous answer score
        nextQuestion = await generateNextQuestion(answerScore);
      }

      // Add next question and move to it
      setQuestions((prev) => [...prev, nextQuestion]);
      setCurrentQuestionIndex((prev) => prev + 1);

      // Reset states
      setAnswer("");
      setRecordedChunks([]);
      setCanEditAnswer(false);

      // Play next question
      setTimeout(() => {
        playQuestionAudio(nextQuestion.text);
      }, 1000);
    } catch (error) {
      console.error("Answer submission error:", error);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setIsLoading(false);
      setIsProcessingAnswer(false);
    }
  };

  const toggleAudio = () => {
    mediaStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    });
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      videoStream?.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      setCameraEnabled(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const videoTracks = newStream.getVideoTracks();
        if (videoTracks.length > 0) {
          const vidStream = new MediaStream([videoTracks[0]]);
          setVideoStream(vidStream);
          setCameraEnabled(true);
        }
      } catch (error) {
        console.error("Error reactivating camera:", error);
        toast.error("Failed to reactivate camera");
      }
    }
  };

  useEffect(() => {
    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
      videoStream?.getTracks().forEach((track) => track.stop());
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [mediaStream, videoStream]);

  const showWarning = !audioEnabled || !cameraEnabled;

  const calculateProgress = () => {
    return (currentQuestionIndex / 14) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50 flex flex-col">
      <AnimatePresence mode="wait">
        {showPopup && (
          <motion.div
            key="popup"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={popupVariants}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 overflow-hidden">
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <Video className="h-10 w-10 text-indigo-600" />
                  </div>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                  Ready for Your Interview
                </h1>

                <div className="space-y-4 text-gray-600">
                  <p className="text-lg">
                    This interview will contain 15 carefully selected questions
                    tailored to assess your skills and experience.
                  </p>
                  <div className="flex items-center justify-center gap-8 my-6">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-blue-100 rounded-full mb-2">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">20-30 min</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-green-100 rounded-full mb-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">15 Questions</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-amber-100 rounded-full mb-2">
                        <Volume2 className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium">Voice Enabled</span>
                    </div>
                  </div>

                  <div className="my-4">
                    <div className="mb-2 flex justify-between text-xs text-gray-500">
                      <span>Question 1</span>
                      <span>Question 15</span>
                    </div>
                    <Progress
                      value={0}
                      className="h-2 rounded-full bg-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="font-semibold mb-3 text-blue-800 flex items-center">
                      <span className="bg-blue-200 p-1 rounded-md mr-2 text-blue-700">
                        ⚙️
                      </span>
                      Requirements
                    </h3>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></div>
                        Stable internet connection
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></div>
                        Webcam & Microphone access
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></div>
                        Quiet environment
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 bg-green-50 rounded-xl border border-green-100 shadow-sm">
                    <h3 className="font-semibold mb-3 text-green-800 flex items-center">
                      <span className="bg-green-200 p-1 rounded-md mr-2 text-green-700">
                        💡
                      </span>
                      Tips for Success
                    </h3>
                    <ul className="space-y-2 text-green-800">
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                        Speak clearly and confidently
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                        Look directly at the camera
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                        Record your answers using voice
                      </li>
                    </ul>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={startInterview}
                  disabled={isLoading}
                  className="w-full mt-4 py-6 text-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-xl rounded-full transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  ) : (
                    <Video className="h-6 w-6 mr-2" />
                  )}
                  Start Interview
                </Button>

                <p className="text-xs text-gray-500 mt-4">
                  By continuing, you agree to our terms and conditions regarding
                  automated interviews.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showPopup && (
          <motion.div
            key="content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex-1"
          >
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 py-3.5 shadow-md">
              <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {formatTime(interviewDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-blue-700">
                  <div className="bg-indigo-50 p-2 rounded-full">
                    <Video className="h-5 w-5 text-blue-700" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight">
                    AI Interview - {applicationData?.job_title}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 px-3 py-1.5 rounded-md text-sm text-blue-700 font-medium border border-blue-100">
                    Question {currentQuestionIndex + 1}/15
                  </div>

                  <button
                    onClick={() => setConfirmExit(true)}
                    className="flex items-center px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Exit
                  </button>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 mt-2">
                <Progress
                  value={calculateProgress()}
                  className="h-1.5 rounded-full bg-gray-200"
                />
              </div>
            </nav>

            <main className="flex-grow max-w-8xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 ml-6 mr-6">
              <section className="lg:col-span-1 space-y-6">
                <motion.div
                  className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl aspect-video"
                  variants={fadeInVariants}
                >
                  {cameraEnabled && videoStream ? (
                    <video
                      ref={videoRef}
                      className="object-cover w-full h-full"
                      autoPlay
                      muted
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center">
                        <VideoOff className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <span className="text-gray-300 text-lg font-medium">
                          Camera is Off
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Video overlay controls */}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={toggleCamera}
                          className={`p-2.5 rounded-full hover:bg-gray-800/80 focus:outline-none transition-all ${
                            cameraEnabled
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                          title="Toggle Camera"
                        >
                          {cameraEnabled ? (
                            <Video className="h-5 w-5" />
                          ) : (
                            <VideoOff className="h-5 w-5" />
                          )}
                        </button>

                        <button
                          onClick={toggleAudio}
                          className={`p-2.5 rounded-full hover:bg-gray-800/80 focus:outline-none transition-all ${
                            audioEnabled
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                          title="Toggle Microphone"
                        >
                          {audioEnabled ? (
                            <Mic className="h-5 w-5" />
                          ) : (
                            <MicOff className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {isRecording && (
                        <div className="flex items-center bg-red-600 px-3 py-1 rounded-full text-white text-sm">
                          <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                          Recording {formatTime(recordingDuration)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {showWarning && (
                    <div className="px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-800">
                            Media Warning
                          </h3>
                          <div className="mt-1 text-sm text-amber-700">
                            <p>
                              Please enable your {!audioEnabled && "microphone"}
                              {!audioEnabled && !cameraEnabled && " and "}
                              {!cameraEnabled && "camera"} for the best
                              interview experience.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {cameraEnabled && (
                    <div className="px-5 py-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Ready to Go
                          </h3>
                          <div className="mt-1 text-sm text-green-700">
                            <p>
                              Your interview is in progress. Take your time and
                              answer each question thoughtfully.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="px-5 py-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Video className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Interview Tips
                        </h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <p>
                            Look directly at the camera while answering
                            questions and maintain a professional posture.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>

              <aside className="lg:col-span-1 flex flex-col gap-6">
                <motion.div
                  className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border border-gray-100"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div
                    className={`w-48 h-48 rounded-full mb-4 overflow-hidden ${
                      isSpeaking
                        ? "ring-4 ring-indigo-400 ring-offset-2 transition-all duration-300"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-full h-full relative ${
                        isSpeaking ? "animate-pulse" : ""
                      }`}
                    >
                      <img
                        src={aibot}
                        alt="AI Interviewer"
                        className="rounded-full w-full h-full object-cover"
                      />
                      {isSpeaking && (
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-blue-700 mb-1">
                    AI Interview Assistant
                  </h2>

                  <div className="text-gray-600 text-center mb-4">
                    <p className="text-sm">
                      {isSpeaking
                        ? "Speaking... please listen carefully"
                        : "Your interview coach and assistant"}
                    </p>
                  </div>

                  {isSpeaking && (
                    <div className="flex justify-center w-full mb-4">
                      <div className="flex space-x-1 items-center">
                        <div className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                        <div
                          className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.6s" }}
                        ></div>
                        <div
                          className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.8s" }}
                        ></div>
                      </div>
                    </div>
                  )}
                </motion.div>
                <motion.div
                  className="bg-white rounded-2xl shadow-xl p-6 relative overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Question Header */}
                  <div className="space-y-4 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-700">
                            Current Question
                          </h3>
                          {questions[currentQuestionIndex]?.difficulty && (
                            <span
                              className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                                questions[currentQuestionIndex]?.difficulty
                              )}`}
                            >
                              {questions[currentQuestionIndex]?.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-medium text-gray-900">
                          {questions[currentQuestionIndex]?.text ||
                            "Loading question..."}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          playQuestionAudio(
                            questions[currentQuestionIndex]?.text
                          )
                        }
                        disabled={isLoading || isSpeaking}
                        className="ml-4 flex-shrink-0 p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Repeat Question"
                      >
                        {isSpeaking ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Answer Input */}
                    <div className="relative mt-4">
                      <textarea
                        value={answer}
                        onChange={(e) => {
                          if (canEditAnswer) setAnswer(e.target.value);
                        }}
                        className="w-full min-h-32 p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-sm"
                        placeholder={
                          canEditAnswer
                            ? "Enter your answer here or use voice recording..."
                            : "Please record your answer or wait..."
                        }
                        disabled={isLoading || !canEditAnswer}
                      />

                      {/* Recording Button */}
                      <button
                        onClick={
                          isRecording
                            ? handleStopRecording
                            : handleStartRecording
                        }
                        disabled={isSpeaking || !canEditAnswer}
                        className={`absolute top-3 right-3 p-2 rounded-lg shadow-sm ${
                          isRecording
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        } transition-colors ${
                          isSpeaking || !canEditAnswer
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title={isRecording ? "Stop Recording" : "Record Answer"}
                      >
                        {isRecording ? (
                          <StopIcon className="h-5 w-5" />
                        ) : (
                          <MicIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={!answer.trim() || isLoading || isSpeaking}
                      className="w-full py-3.5 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-colors rounded-xl shadow-md mt-4"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : currentQuestionIndex < 14 ? (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Answer & Continue
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Complete Interview
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </aside>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit confirmation popup */}
      <AnimatePresence>
        {confirmExit && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="mr-3 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100 sm:w-12 sm:h-12">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Exit Interview?
                  </h3>
                </div>
                <button
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setConfirmExit(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Are you sure you want to exit? Your interview progress will
                  not be saved, and you'll need to restart from the beginning if
                  you return.
                </p>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={() => setConfirmExit(false)}
                  >
                    Continue Interview
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                    onClick={() => navigate("/complete")}
                  >
                    Exit Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIInterview;
