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
import { useAuthStore } from "../../store/authStore";

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
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const { user } = useAuthStore();

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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  // Prevent navigation and tab switching

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showPopup && !confirmExit) {
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
  }, [showPopup, confirmExit]);

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
      return response.data;
    } catch (error) {
      console.error("Failed to fetch application data:", error);
      toast.error("Failed to load application details");
      throw error;
    }
  };

  const startInterview = async () => {
    setShowPopup(false);
    setIsLoading(true);

    try {
      const appData = await fetchApplicationData();

      const response = await api.post("/interviews/start/", {
        application_id: applicationId,
      });

      if (!response.data?.interview_id || !response.data?.questions?.length) {
        throw new Error(
          "Invalid interview initialization response from server."
        );
      }

      await playAudio(
        `Hello ${user?.name}` +
          `Welcome to your interview at ${appData.job_details.company_name} ` +
          `for the ${appData.job_details.title} position. ` +
          `We will start with the first question.`
      );
      setInterviewId(response.data.interview_id); // Play Interoduction
      const fetchedQuestions: QuestionData[] = response.data.questions.map(
        (q: any) => ({
          text: q.text,
          difficulty: q.difficulty,
          is_predefined: q.is_predefined !== undefined ? q.is_predefined : true,
        })
      );
      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);

      await initializeMediaStream();

      if (fetchedQuestions.length > 0) {
        await playQuestionAudio(fetchedQuestions[0].text);
      } else {
        toast.error("No questions were loaded, cannot play introduction.");
      }
    } catch (error) {
      console.error("Interview start error:", error);
      const errMsg =
        (error as any)?.response?.data?.error ||
        (error as Error).message ||
        "Failed to start interview";
      toast.error(errMsg);
      setShowPopup(true);
      setQuestions([]);
      setInterviewId("");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (text: string) => {
    try {
      setIsSpeaking(true);
      setIsAudioPlaying(true);

      const response = await api.post(
        "/interviews/tts/",
        { text },
        { responseType: "blob" }
      );

      if (response.data.size === 0) {
        throw new Error("Empty audio response from server");
      }
      if (response.status !== 200) {
        const errorData = await response.data.text();
        throw new Error(`TTS Error: ${errorData}`);
      }

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false);
          setIsAudioPlaying(false);
          resolve();
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          setIsAudioPlaying(false);
          toast.error("Audio playback failed");
          reject(new Error("Audio playback failed"));
        };

        audio.play().catch((err) => {
          setIsSpeaking(false);
          setIsAudioPlaying(false);
          toast.error("Audio playback failed");
          reject(err);
        });
      });
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      setIsAudioPlaying(false);

      let message = "Speech synthesis failed";
      if (typeof error === "object" && error !== null) {
        if (
          "response" in error &&
          typeof (error as any).response?.data?.error === "string"
        ) {
          message = (error as any).response.data.error;
        } else if (
          "message" in error &&
          typeof (error as any).message === "string"
        ) {
          message = (error as any).message;
        }
      }

      toast.error(message);
      throw error;
    }
  };

  const playQuestionAudio = async (questionText: string) => {
    try {
      await playAudio(questionText);
      setCanEditAnswer(true);
      handleStartRecording();
    } catch (error) {
      console.error(
        "Error in playQuestionAudio, enabling answer edit as fallback:",
        error
      );
      setCanEditAnswer(true);
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
      toast.error(
        "Camera and microphone access are required for the interview. Please grant permissions and refresh."
      );
      throw error;
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(console.error);
    }
  }, [videoStream]);

  const handleStartRecording = () => {
    if (!mediaStream) {
      toast.error(
        "Media stream not available. Please check camera/microphone permissions."
      );
      return;
    }
    if (isSpeaking) {
      toast.error("Please wait for the AI to finish speaking.");
      return;
    }

    console.log("handleStartRecording: Creating MediaRecorder.");
    const localRecordedChunks: Blob[] = [];
    const recorder = new MediaRecorder(mediaStream);

    recorder.ondataavailable = (e) => {
      console.log(
        "recorder.ondataavailable event fired. e.data.size:",
        e.data.size
      );
      if (e.data.size > 0) {
        localRecordedChunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      console.log("recorder.onstop event fired.");
      setRecordedChunks(localRecordedChunks);
      const audioBlob = new Blob(localRecordedChunks, { type: "audio/webm" });
      console.log("onstop: audioBlob created. Size:", audioBlob.size);

      if (audioBlob.size > 0) {
        console.log(
          "onstop: audioBlob size is > 0. Calling processRecordedAnswer."
        );
        await processRecordedAnswer(audioBlob);
      } else {
        console.log(
          "onstop: audioBlob size is 0. Not calling processRecordedAnswer. Chunks were empty."
        );
        toast("No audio recorded. Please try again.");
        setCanEditAnswer(true);
      }
    };

    recorder.onerror = (e) => {
      console.error("MediaRecorder error:", e);
      toast.error("Recording failed. Please try again.");
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    };

    // Reset state for the new recording
    setRecordedChunks([]);
    setAnswer("");
    setMediaRecorder(recorder);

    recorder.start();
    console.log("recorder.start() called.");
    setIsRecording(true);

    setRecordingDuration(0);
    if (recordingTimer.current) clearInterval(recordingTimer.current);
    recordingTimer.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = async () => {
    console.log("handleStopRecording: Function called.");
    if (mediaRecorder && isRecording) {
      console.log("handleStopRecording: Stopping recorder.");
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    } else {
      console.warn("handleStopRecording called but no active recorder found.");
    }
  };

  const processRecordedAnswer = async (audioBlob: Blob) => {
    console.log("processRecordedAnswer: Function called with blob:", audioBlob);
    try {
      setIsProcessingAnswer(true);
      const formData = new FormData();
      formData.append("audio", audioBlob, "answer.webm");
      console.log(
        "processRecordedAnswer: FormData created. 'audio' entry:",
        formData.get("audio")
      );

      console.log(
        "processRecordedAnswer: Attempting api.post to /interviews/stt/"
      );
      const sttResponse = await api.post("/interviews/stt/", formData);
      console.log(
        "processRecordedAnswer: api.post successful. Response:",
        sttResponse
      );

      const transcribedText = sttResponse.data.text;
      setAnswer(transcribedText);
      setCanEditAnswer(true);
    } catch (error) {
      console.error("processRecordedAnswer: Error during STT call:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const errObj = error as { response: any };
        console.error(
          "processRecordedAnswer: Error response data:",
          errObj.response.data
        );
        console.error(
          "processRecordedAnswer: Error response status:",
          errObj.response.status
        );
        console.error(
          "processRecordedAnswer: Error response headers:",
          errObj.response.headers
        );
      } else if (
        typeof error === "object" &&
        error !== null &&
        "request" in error
      ) {
        const errObj = error as { request: any };
        console.error(
          "processRecordedAnswer: Error request data:",
          errObj.request
        );
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        const errObj = error as { message: string };
        console.error("processRecordedAnswer: Error message:", errObj.message);
      } else {
        console.error("processRecordedAnswer: Unknown error:", error);
      }
      toast.error("Voice-to-text failed. Please type your answer.");
      setCanEditAnswer(true);
    } finally {
      setIsProcessingAnswer(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim() || isProcessingAnswer || isLoading || isRecording)
      return;

    setIsProcessingAnswer(true);
    setIsLoading(true);
    setCanEditAnswer(false);

    try {
      const formData = new FormData();
      formData.append("question", questions[currentQuestionIndex]?.text || "");
      formData.append("answer_text", answer);

      formData.append(
        "question_text",
        questions[currentQuestionIndex]?.text || "Unknown question"
      );
      formData.append("question_index", currentQuestionIndex.toString());

      if (recordedChunks.length > 0) {
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
        formData.append("answer_audio", audioBlob, "answer.webm");
      }

      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        cameraEnabled
      ) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageQuality = 0.8;
          canvas.toBlob(
            (blob) => {
              if (blob) {
                formData.append("video_frame", blob, "frame.jpg");
              }

              sendFormData(formData);
            },
            "image/jpeg",
            imageQuality
          );
        } else {
          await sendFormData(formData);
        }
      } else {
        await sendFormData(formData);
      }
    } catch (error) {
      console.error("Answer submission preparation error:", error);
      toast.error("Failed to prepare answer for submission. Please try again.");
      setIsLoading(false);
      setIsProcessingAnswer(false);
      setCanEditAnswer(true);
    }
  };

  const sendFormData = async (formData: FormData) => {
    try {
      const response = await api.post(
        `/interviews/${interviewId}/submit-answer/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.completed || currentQuestionIndex >= 14) {
        toast.success("Interview completed!");
        navigate(`/interview-result/${interviewId}`);
        return;
      }

      const backendNextQuestion = response.data.next_question;
      if (backendNextQuestion && backendNextQuestion.text) {
        const newQuestion: QuestionData = {
          text: backendNextQuestion.text,
          difficulty: backendNextQuestion.difficulty,
          is_predefined: false,
        };

        setQuestions((prev) => [...prev, newQuestion]);
        setCurrentQuestionIndex((prev) => prev + 1);
        setAnswer("");
        setRecordedChunks([]);
        setTimeout(() => {
          playQuestionAudio(newQuestion.text);
        }, 500);
      } else {
        console.warn(
          "No next question received, but interview not marked as completed. Navigating to results."
        );
        toast("Reached the end of available questions.");
        navigate(`/interview-result/${interviewId}`);
      }
    } catch (error) {
      console.error("Answer submission error:", error);
      toast.error("Failed to submit answer. Please try again.");
      setCanEditAnswer(true);
    } finally {
      setIsLoading(false);
      setIsProcessingAnswer(false);
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      });
      if (!audioEnabled) toast.success("Microphone enabled");
      else toast.error("Microphone disabled");
    }
  };

  const toggleCamera = async () => {
    if (cameraEnabled && mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => track.stop());
      if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
      setCameraEnabled(false);
      toast.error("Camera disabled");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setVideoStream(stream);
        setCameraEnabled(true);
        toast.success("Camera enabled");
      } catch (error) {
        console.error("Error reactivating camera:", error);
        toast.error("Failed to reactivate camera. Please check permissions.");
      }
    }
  };

  const showWarning = !audioEnabled || !cameraEnabled;

  const calculateProgress = () => {
    if (questions.length === 0) return 0;
    return (currentQuestionIndex / 15) * 100;
  };

  const currentDisplayedQuestion = questions[currentQuestionIndex];
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden">
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <Video className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 ">
                  Ready for Your Interview?
                </h1>

                <div className="space-y-4 text-gray-600">
                  <p className="text-md sm:text-lg">
                    This AI-powered interview will contain 15 questions to
                    assess your skills.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 my-4 sm:my-6">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-blue-100 rounded-full mb-1 sm:mb-2">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        Approx. 20-30 min
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-green-100 rounded-full mb-1 sm:mb-2">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        15 Questions
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-amber-100 rounded-full mb-1 sm:mb-2">
                        <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        Voice Enabled
                      </span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left text-sm">
                  <div className="p-4 sm:p-5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="font-semibold mb-2 sm:mb-3 text-blue-800 flex items-center">
                      <span className="bg-blue-200 p-1 rounded-md mr-2 text-blue-700 text-lg">
                        ⚙️
                      </span>
                      Requirements
                    </h3>
                    <ul className="space-y-1.5 sm:space-y-2 text-blue-700">
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

                  <div className="p-4 sm:p-5 bg-green-50 rounded-xl border border-green-100 shadow-sm">
                    <h3 className="font-semibold mb-2 sm:mb-3 text-green-800 flex items-center">
                      <span className="bg-green-200 p-1 rounded-md mr-2 text-green-700 text-lg">
                        💡
                      </span>
                      Tips for Success
                    </h3>
                    <ul className="space-y-1.5 sm:space-y-2 text-green-700">
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
                        Use voice recording for answers
                      </li>
                    </ul>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={startInterview}
                  disabled={isLoading}
                  className="w-full mt-4 sm:mt-6 py-3 sm:py-4 text-lg sm:text-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-xl rounded-full transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
                  ) : (
                    <Video className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  )}
                  Start Interview
                </Button>

                <p className="text-xs text-gray-500 mt-3 sm:mt-4">
                  By continuing, you agree to our terms for automated
                  interviews.
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
            className="flex-1 flex flex-col"
          >
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 py-3 shadow-sm">
              <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-full">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {formatTime(interviewDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-indigo-700">
                  <div className="bg-indigo-50 p-1.5 sm:p-2 rounded-full">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-700" />
                  </div>
                  <h1 className="text-md sm:text-xl font-semibold tracking-tight">
                    AI_VIS Interview
                  </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm text-blue-700 font-medium border border-blue-100">
                    Question {currentQuestionIndex + 1}/15
                  </div>

                  <button
                    onClick={() => setConfirmExit(true)}
                    className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium rounded-md transition-all"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                    Exit
                  </button>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-2">
                <Progress
                  value={calculateProgress()}
                  className="h-1 sm:h-1.5 rounded-full bg-gray-200"
                />
              </div>
            </nav>
            <main className="flex-grow max-w-8xl w-full mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <section className="lg:col-span-1 space-y-4 sm:space-y-6">
                <motion.div
                  className="relative bg-gradient-to-b from-gray-800 to-gray-700 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video"
                  variants={fadeInVariants}
                >
                  {cameraEnabled && videoStream ? (
                    <video
                      ref={videoRef}
                      className="object-cover w-full h-full"
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="text-center">
                        <VideoOff className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                        <span className="text-gray-300 text-md sm:text-lg font-medium">
                          Camera is Off
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 inset-x-0 p-2 sm:p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1.5 sm:gap-2">
                        <button
                          onClick={toggleCamera}
                          className={`p-2 sm:p-2.5 rounded-full focus:outline-none transition-all ${
                            cameraEnabled
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-gray-600 hover:bg-gray-500 text-gray-200"
                          }`}
                          title={
                            cameraEnabled ? "Turn Camera Off" : "Turn Camera On"
                          }
                        >
                          {cameraEnabled ? (
                            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>

                        <button
                          onClick={toggleAudio}
                          className={`p-2 sm:p-2.5 rounded-full focus:outline-none transition-all ${
                            audioEnabled
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-gray-600 hover:bg-gray-500 text-gray-200"
                          }`}
                          title={
                            audioEnabled
                              ? "Mute Microphone"
                              : "Unmute Microphone"
                          }
                        >
                          {audioEnabled ? (
                            <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </div>

                      {isRecording && (
                        <div className="flex items-center bg-red-600 px-2 py-1 sm:px-3 rounded-full text-white text-xs sm:text-sm">
                          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                          Recording {formatTime(recordingDuration)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="space-y-3 sm:space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {showWarning && (
                    <div className="px-4 py-3 sm:px-5 sm:py-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                        </div>
                        <div className="ml-2 sm:ml-3">
                          <h3 className="text-sm font-medium text-amber-800">
                            Media Warning
                          </h3>
                          <div className="mt-1 text-xs sm:text-sm text-amber-700">
                            <p>
                              Please enable your {!audioEnabled && "microphone"}
                              {!audioEnabled && !cameraEnabled && " and "}
                              {!cameraEnabled && "camera"} for the best
                              experience.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {cameraEnabled && audioEnabled && !showWarning && (
                    <div className="px-4 py-3 sm:px-5 sm:py-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        </div>
                        <div className="ml-2 sm:ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            System Ready
                          </h3>
                          <div className="mt-1 text-xs sm:text-sm text-green-700">
                            <p>
                              Your camera and microphone are active. Focus on
                              the questions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="px-4 py-3 sm:px-5 sm:py-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <MicIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Interview Tips
                        </h3>
                        <div className="mt-1 text-xs sm:text-sm text-blue-700">
                          <p>
                            Speak clearly. Look at the camera. Record answers
                            via voice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
              <aside className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
                {" "}
                {/* This remains lg:col-span-1 */}
                {/* AI assistant and Question/Answer JSX remains the same */}
                {/* ... motion.div for AI assistant ... */}
                {/* ... motion.div for Question/Answer ... */}
                {/* (These parts are identical to the previous full code response) */}
                <motion.div
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center border border-gray-100"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div
                    className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-3 sm:mb-4 overflow-hidden transition-all duration-300 ${
                      isSpeaking
                        ? "ring-4 ring-indigo-400 ring-offset-2"
                        : "ring-1 ring-gray-200"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent" />
                      )}
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-1">
                    AI Interview Assistant
                  </h2>

                  <div className="text-gray-600 text-center mb-3 sm:mb-4 h-10">
                    <p className="text-xs sm:text-sm">
                      {isSpeaking
                        ? "Listening to the question..."
                        : isLoading
                        ? "Processing your answer..."
                        : isRecording
                        ? "Recording your answer..."
                        : "Ready for your response."}
                    </p>
                  </div>

                  {isSpeaking && (
                    <div className="flex justify-center w-full mb-3 sm:mb-4">
                      <div className="flex space-x-1 items-center">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-1.5 sm:w-1.5 sm:h-2 bg-indigo-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
                <motion.div
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 relative overflow-hidden border border-gray-100 flex-grow flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-3 sm:space-y-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1">
                        <p className="text-md sm:text-lg font-medium text-gray-800 leading-relaxed">
                          {currentDisplayedQuestion?.text ||
                            (isLoading && !isProcessingAnswer
                              ? "Loading interview..."
                              : "Waiting for question...")}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (currentDisplayedQuestion?.text) {
                            playQuestionAudio(currentDisplayedQuestion.text);
                          }
                        }}
                        disabled={
                          isLoading ||
                          isSpeaking ||
                          !currentDisplayedQuestion?.text
                        }
                        className="ml-2 sm:ml-4 flex-shrink-0 p-1.5 sm:p-2 rounded-full text-indigo-600 hover:bg-indigo-50 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
                        title="Repeat Question"
                      >
                        {isSpeaking && !isLoading ? (
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        ) : (
                          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>

                    <div className="relative mt-2 sm:mt-4 flex-grow flex flex-col">
                      <textarea
                        value={answer}
                        onChange={(e) => {
                          if (canEditAnswer) setAnswer(e.target.value);
                        }}
                        className="w-full flex-grow p-3 sm:p-4 pr-10 sm:pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-sm text-sm sm:text-base"
                        placeholder={
                          isProcessingAnswer
                            ? "Converting speech to text..."
                            : isRecording
                            ? "Recording... Speak now"
                            : canEditAnswer
                            ? "Type or record your answer..."
                            : "Please wait..."
                        }
                        disabled={
                          isLoading ||
                          !canEditAnswer ||
                          isRecording ||
                          isSpeaking
                        }
                        rows={5}
                      />

                      <button
                        onClick={
                          isRecording
                            ? handleStopRecording
                            : handleStartRecording
                        }
                        disabled={isAudioPlaying || !canEditAnswer || isLoading}
                        className={`absolute top-2 right-2 p-2 rounded-lg ${
                          isRecording
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-indigo-500 text-white hover:bg-indigo-600"
                        } ${
                          isAudioPlaying || !canEditAnswer || isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {isRecording ? (
                          <StopIcon className="h-4 w-4" />
                        ) : (
                          <MicIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={
                        isAudioPlaying ||
                        !canEditAnswer ||
                        isLoading ||
                        isProcessingAnswer ||
                        isRecording
                      }
                    >
                      {isLoading || isProcessingAnswer ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Submit Answer
                    </Button>
                  </div>
                </motion.div>
              </aside>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit confirmation popup JSX remains the same */}
      <AnimatePresence>
        {confirmExit && (
          // ... Exit confirmation motion.div and content ...
          // (This part is identical to the previous full code response)
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 sm:p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center">
                  <div className="mr-2 sm:mr-3 flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <h3 className="text-md sm:text-lg font-medium text-gray-900">
                    Exit Interview?
                  </h3>
                </div>
                <button
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setConfirmExit(false)}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <div className="mt-2 sm:mt-3">
                <p className="text-sm text-gray-600">
                  Are you sure? Your progress will be lost. You'll need to
                  restart if you return.
                </p>

                <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setConfirmExit(false)}
                  >
                    Continue Interview
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-sm sm:text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => {
                      setConfirmExit(false);
                      navigate("/complete");
                    }}
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
