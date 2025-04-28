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
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/progress";
import aibot from "../../assets/public/images/aibot.jpg";
import api from "../../api";
import toast from "react-hot-toast";

interface QuestionData {
  text: string;
  difficulty: string;
}

const popupVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.1, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
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

  // Start interview
  // const startInterview = async () => {

  //   setShowPopup(false);

  //   try {
  //     const token = localStorage.getItem("accessToken");

  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     const response = await fetch("/interview/start", {
  //       // Added /api/ prefix
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         application_id: "your_application_id", // Should come from props/state
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || "Failed to start interview");
  //     }

  //     const data = await response.json(); // Parse JSON response

  //     // Destructure after validation
  //     const {
  //       interview_id: interviewId,
  //       questions,
  //       current_question: currentQuestion,
  //     } = data;

  //     if (!questions || !questions.length) {
  //       throw new Error("No questions received");
  //     }

  //     setInterviewId(interviewId);
  //     setQuestions(questions);
  //     setCurrentQuestionIndex(currentQuestion);

  //     // Initialize media first
  //     await initializeMediaStream();

  //     playQuestionAudio(questions[currentQuestion].text);
  //     startVideoRecording();
  //   } catch (error) {
  //     console.error("Interview start error:", error);
  //     toast.error(
  //       error instanceof Error ? error.message : "Failed to start interview"
  //     );

  //     // Reset state on error
  //     // setShowPopup(true);
  //     setInterviewId("");
  //     setQuestions([]);
  //   }
  // };

  const startInterview = async () => {
    setShowPopup(false);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No authentication token found");

      const response = await api.post("/interview/start", {
        application_id: applicationId,
      });

      const data = response.data;

      setInterviewId(data.interview_id);
      setQuestions(data.questions);
      setCurrentQuestionIndex(data.current_question);

      await initializeMediaStream();
      playQuestionAudio(data.questions[data.current_question].text);
      startVideoRecording();
    } catch (error) {
      console.error("Interview start error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start interview"
      );
      // setShowPopup(true);
    }
  };

  // Add media initialization function
  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      const videoStream = new MediaStream(stream.getVideoTracks());
      setVideoStream(videoStream);
    } catch (error) {
      console.error("Media initialization failed:", error);
      throw new Error("Camera/microphone access required");
    }
  };

  // Initialize media streams
  useEffect(() => {
    if (!showPopup) {
      const initializeMedia = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setMediaStream(stream);
          const videoStream = new MediaStream(stream.getVideoTracks());
          setVideoStream(videoStream);
        } catch (error) {
          console.error("Error accessing media devices:", error);
        }
      };
      initializeMedia();
    }
  }, [showPopup]);

  // Set video element source
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(console.error);
    }
  }, [videoStream]);

  // Video recording handling
  const startVideoRecording = () => {
    if (mediaStream) {
      const recorder = new MediaRecorder(mediaStream);
      recorder.start();
      setMediaRecorder(recorder);
    }
  };

  // Question audio handling
  const playQuestionAudio = async (questionText: string) => {
    try {
      setIsSpeaking(true);
      const response = await api.post(
        "/azure/tts/",
        { text: questionText },
        {
          responseType: "blob",
        }
      );

      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  // Answer recording handling
  const handleStartRecording = () => {
    if (mediaStream) {
      const recorder = new MediaRecorder(mediaStream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          const sttResponse = await api.post("/azure/stt/", formData);
          setAnswer(sttResponse.data.text);
        } catch (error) {
          console.error("STT error:", error);
        }
        setRecordedChunks([]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Submit answer and get next question
  const handleAnswerSubmit = async () => {
    if (!answer.trim()) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", new Blob(recordedChunks));
      if (mediaStream) {
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const videoRecorder = new MediaRecorder(
            new MediaStream([videoTrack])
          );
          const videoChunks: Blob[] = [];

          videoRecorder.ondataavailable = (e) => {
            videoChunks.push(e.data);
          };

          videoRecorder.start();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          videoRecorder.stop();

          const videoBlob = new Blob(videoChunks, { type: "video/webm" });
          formData.append("video", videoBlob);
        }
      }

      const response = await api.post(
        `/interview/${interviewId}/submit`,
        formData
      );

      const { current_question, is_completed, next_question } = response.data;

      setCurrentQuestionIndex(current_question);

      if (is_completed) {
        navigate("/complete");
      } else {
        playQuestionAudio(next_question);
        startVideoRecording();
      }

      setAnswer("");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit answer");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle media controls
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
      }
    }
  };

  // Cleanup media streams
  useEffect(() => {
    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
      videoStream?.getTracks().forEach((track) => track.stop());
    };
  }, [mediaStream, videoStream]);

  const showWarning = !audioEnabled || !cameraEnabled;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col">
      <AnimatePresence mode="wait">
        {showPopup && (
          <motion.div
            key="popup"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            // variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="text-center space-y-6">
                <h1 className="text-4xl font-extrabold text-gray-800">
                  🚀 Ready for Your Interview?
                </h1>
                <div className="space-y-4 text-gray-600">
                  <p>This interview will contain 15 exciting questions 🎤</p>
                  <p>Estimated duration: 20-30 minutes ⏱️</p>
                  <div className="my-4">
                    <Progress
                      value={(currentQuestionIndex / 15) * 100}
                      className="h-2 rounded-full bg-green-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-left">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Requirements ⚙️</h3>
                    <ul className="list-disc pl-4 space-y-1 text-blue-900">
                      <li>Stable internet connection</li>
                      <li>Webcam & Microphone</li>
                      <li>Quiet environment</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tips 💡</h3>
                    <ul className="list-disc pl-4 space-y-1 text-green-900">
                      <li>Dress professionally 👔</li>
                      <li>Look directly at the camera 👀</li>
                      <li>Speak clearly and confidently 🗣️</li>
                    </ul>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={startInterview}
                  disabled={isLoading}
                  className="w-full py-6 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl rounded-full transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  ) : (
                    <Video className="h-6 w-6 mr-2" />
                  )}
                  Start Interview Now
                </Button>
              </div>
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
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 py-4 shadow-sm">
              <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
                <div className="w-1/3" />
                <div className="flex items-center justify-center w-1/3 gap-2 text-indigo-700">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Video className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    AI-VIS Interview
                  </h1>
                </div>
                <div className="w-1/3 flex justify-end">
                  <button
                    onClick={() => navigate("/complete")}
                    className="relative inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-indigo-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                  >
                    <span className="absolute left-0 top-0 h-full w-full bg-indigo-700 opacity-0 group-hover:opacity-5 transition duration-300 rounded-xl" />
                    Exit Interview
                    <svg
                      className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </nav>

            <main className="flex-grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="space-y-6">
                <div className="relative bg-gray-200 rounded-2xl overflow-hidden shadow-xl aspect-video">
                  {cameraEnabled && videoStream ? (
                    <video
                      ref={videoRef}
                      className="object-cover w-full h-full"
                      autoPlay
                      muted
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <span className="text-gray-700 text-lg">
                        🚫 Camera is Off
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-3 z-10">
                    <button
                      onClick={toggleCamera}
                      className="bg-white p-2 rounded-full shadow hover:bg-gray-100 focus:outline-none transition-transform transform hover:scale-110"
                      title="Toggle Camera"
                    >
                      {cameraEnabled ? (
                        <Video className="h-6 w-6 text-indigo-600" />
                      ) : (
                        <VideoOff className="h-6 w-6 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={toggleAudio}
                      className="bg-white p-2 rounded-full shadow hover:bg-gray-100 focus:outline-none transition-transform transform hover:scale-110"
                      title="Toggle Microphone"
                    >
                      {audioEnabled ? (
                        <Mic className="h-6 w-6 text-indigo-600" />
                      ) : (
                        <MicOff className="h-6 w-6 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.div
                  className="bg-white rounded-2xl shadow-2xl p-6 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="space-y-4 relative">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {questions[currentQuestionIndex]?.text ||
                        "Loading question..."}
                    </h3>
                    <div className="relative">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-full h-48 p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Type or edit your answer here..."
                        disabled={isLoading}
                      />
                      <button
                        onClick={
                          isRecording
                            ? handleStopRecording
                            : handleStartRecording
                        }
                        className="absolute top-2 right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow hover:bg-indigo-700 transition-colors"
                        title={isRecording ? "Stop Recording" : "Record Answer"}
                      >
                        {isRecording ? (
                          <StopIcon className="h-5 w-5" />
                        ) : (
                          <MicIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </section>

              <aside className="flex flex-col gap-6">
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <div
                    className={`mx-auto w-48 h-48 rounded-full p-1 mb-4 transition-all ${
                      isSpeaking
                        ? "animate-pulse-wave"
                        : "border border-gray-300"
                    }`}
                  >
                    <img
                      src={aibot}
                      alt="AI Interviewer"
                      className="rounded-full w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-indigo-700">
                    AI Interviewer 🤖
                  </h2>
                  <div className="text-gray-600 text-center space-y-2">
                    <p>
                      {isSpeaking
                        ? "Speaking... 🗣️"
                        : "Analyzing responses & generating questions... 🔍"}
                    </p>
                  </div>
                  <div className="mt-4 p-2 bg-indigo-50 rounded-md shadow-inner">
                    <span className="text-sm text-indigo-800">
                      Question {currentQuestionIndex + 1} of 15
                    </span>
                  </div>
                </motion.div>

                <div className="flex gap-4">
                  <Button
                    onClick={() =>
                      playQuestionAudio(questions[currentQuestionIndex]?.text)
                    }
                    disabled={isLoading}
                    className="w-full py-3 flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                  >
                    <Repeat className="h-5 w-5 mr-2" />
                    Repeat Question
                  </Button>
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!answer.trim() || isLoading}
                    className="w-full py-3 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : currentQuestionIndex < 14 ? (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Answer
                      </>
                    ) : (
                      "Complete Interview 🎉"
                    )}
                  </Button>
                </div>

                {cameraEnabled && (
                  <motion.div
                    className="px-4 py-4 bg-green-100 border border-green-300 text-green-800 rounded-md shadow text-sm font-medium text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    🎥 Interview in Progress - Stay focused and shine! ✨
                  </motion.div>
                )}

                {showWarning && (
                  <motion.div
                    className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-sm text-center"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    ⚠️ Warning: Please ensure your camera and microphone are
                    enabled
                  </motion.div>
                )}

                <Button
                  onClick={() => navigate("/complete")}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-colors shadow-xl rounded-full"
                  disabled={currentQuestionIndex < 14}
                >
                  Complete Interview 🚀
                </Button>
              </aside>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIInterview;
