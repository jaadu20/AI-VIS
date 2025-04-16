import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export function AIInterview() {
  const navigate = useNavigate();

  // Interview flow states
  const [showPopup, setShowPopup] = useState(true);
  const [answer, setAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const staticQuestions = [
    "Tell me about yourself",
    "Why do you want to apply for this job? 💼",
  ];
  const [questions, setQuestions] = useState<string[]>([...staticQuestions]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Media states for video and voice recording
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Recording states for STT
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Start interview by hiding popup and initializing media.
  const startInterview = () => {
    setShowPopup(false);
    playQuestionAudio(questions[0]);
  };

  // Initialize video & audio (store full media stream for later recording)
  useEffect(() => {
    if (!showPopup) {
      const startMedia = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setMediaStream(stream);
          // Set video stream using only the video track for display
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length > 0) {
            const vidStream = new MediaStream([videoTracks[0]]);
            setVideoStream(vidStream);
            setCameraEnabled(true);
          }
          // Ensure audio is enabled
          if (stream.getAudioTracks().length > 0) {
            setAudioEnabled(true);
          }
        } catch (error) {
          console.error("Error accessing media devices:", error);
        }
      };
      startMedia();
    }
  }, [showPopup]);

  // Set the video element’s srcObject when videoStream updates.
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current
        .play()
        .catch((err) => console.error("Error playing video:", err));
    }
  }, [videoStream]);

  // Toggle microphone
  const toggleAudio = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      });
    }
  };

  // Toggle camera: stops current track and reinitializes if needed.
  const toggleCamera = async () => {
    if (cameraEnabled) {
      if (videoStream) {
        videoStream.getVideoTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }
      setCameraEnabled(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        const videoTracks = newStream.getVideoTracks();
        if (videoTracks.length > 0) {
          const vidStream = new MediaStream([videoTracks[0]]);
          setVideoStream(vidStream);
          setCameraEnabled(true);
        }
      } catch (error) {
        console.error("Error reactivating the camera:", error);
      }
    }
  };

  // Use the Azure TTS backend endpoint to play the question audio.
  const playQuestionAudio = async (questionText: string) => {
    try {
      const response = await fetch("api/azure/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questionText }),
      });
      if (!response.ok) throw new Error("TTS service error");
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  // Play audio when current question changes.
  useEffect(() => {
    if (!showPopup && questions[currentQuestionIndex]) {
      playQuestionAudio(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, questions, showPopup]);

  // Generate next question from backend dynamically.
  const generateNextQuestion = async (
    jobDescription: string,
    prevAnswer: string
  ) => {
    try {
      const response = await fetch("/api/interview/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          previousAnswer: prevAnswer,
          questionLevel: "adaptive",
        }),
      });
      const data = await response.json();
      return data.question as string;
    } catch (error) {
      console.error("Error generating question:", error);
      return "Sorry, we couldn't generate the next question at this time.";
    }
  };

  // Handle answer submission.
  const handleAnswerSubmit = async () => {
    if (!answer.trim()) return;
    setIsLoading(true);
    try {
      const submitResponse = await fetch("/api/interview/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          question: questions[currentQuestionIndex],
        }),
      });

      if (!submitResponse.ok) {
        console.error("Failed to submit answer");
        setIsLoading(false);
        return;
      }

      let nextQuestion = "";

      if (currentQuestionIndex === 0) {
        nextQuestion = questions[currentQuestionIndex + 1];
      } else if (currentQuestionIndex === 1) {
        const dummyJobDescription =
          "This job requires expertise in full-stack development with experience in React and Django.";
        nextQuestion = await generateNextQuestion(dummyJobDescription, answer);
      } else if (currentQuestionIndex < 14) {
        const dummyJobDescription =
          "This job requires expertise in full-stack development with experience in React and Django.";
        nextQuestion = await generateNextQuestion(dummyJobDescription, answer);
      }

      if (currentQuestionIndex < 14) {
        setQuestions((prev) => [...prev, nextQuestion]);
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      setAnswer("");
    } catch (error) {
      console.error("Error during answer submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Repeat the current question via TTS.
  const handleRepeatQuestion = () => {
    if (questions[currentQuestionIndex]) {
      playQuestionAudio(questions[currentQuestionIndex]);
    }
  };

  // ----- Voice Recording Functions for STT -----
  const handleStartRecording = () => {
    if (!mediaStream) return;
    try {
      const recorder = new MediaRecorder(mediaStream);
      setRecordedChunks([]); // clear previous chunks
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob);
        try {
          const response = await fetch("/api/azure/stt", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.text) {
            setAnswer(data.text);
          } else {
            console.error("STT error:", data.error);
          }
        } catch (err) {
          console.error("Error sending recorded audio:", err);
        }
        setRecordedChunks([]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Show a warning if either microphone or camera is disabled.
  const showWarning = !audioEnabled || !cameraEnabled;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col">
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fadeIn">
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
        </div>
      )}

      {!showPopup && (
        <>
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 py-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
              {/* Left Spacer */}
              <div className="w-1/3" />

              {/* Center Logo */}
              <div className="flex items-center justify-center w-1/3 gap-2 text-indigo-700">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Video className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  AI-VIS Interview
                </h1>
              </div>

              {/* Right Button */}
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

              <div className="bg-white rounded-2xl shadow-2xl p-6 relative">
                <div className="space-y-4 relative">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {questions[currentQuestionIndex]}
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
                        isRecording ? handleStopRecording : handleStartRecording
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
              </div>
            </section>

            <aside className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
                <div
                  className={`mx-auto w-48 h-48 rounded-full p-1 mb-4 transition-all ${
                    isSpeaking ? "animate-pulse-wave" : "border border-gray-300"
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
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleRepeatQuestion}
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
                <div className="px-4 py-4 bg-green-100 border border-green-300 text-green-800 rounded-md shadow text-sm font-medium text-center">
                  🎥 Interview in Progress - Stay focused and shine! ✨
                </div>
              )}

              {showWarning && (
                <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-sm text-center">
                  ⚠️ Warning: Please ensure your camera and microphone are
                  enabled.
                </div>
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
        </>
      )}
    </div>
  );
}

export default AIInterview;
