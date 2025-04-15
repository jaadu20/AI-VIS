import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, Send, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/progress";
import aibot from "../../assets/public/images/aibot.jpg";

export function AIInterview() {
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(true);
  const [answer, setAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const startInterview = () => {
    setShowPopup(false);
    setQuestions([
      "1. Tell me about yourself",
      "2. Why do you want to apply for this job?",
      "3. What interests you the most about our company?",
    ]);
  };

  useEffect(() => {
    if (!showPopup) {
      const startMedia = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();

          if (videoTracks.length > 0) {
            const vidStream = new MediaStream([videoTracks[0]]);
            setVideoStream(vidStream);
            setCameraEnabled(true);
          }
          if (audioTracks.length > 0) {
            setAudioTrack(audioTracks[0]);
            setAudioEnabled(true);
          }
        } catch (error) {
          console.error("Error accessing media devices:", error);
        }
      };
      startMedia();
    }
  }, [showPopup]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
      if (videoStream) {
        videoRef.current.play().catch((err) => console.error(err));
      }
    }
  }, [videoStream]);

  const toggleAudio = () => {
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

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

  // const handleAnswerSubmit = async () => {
  //   if (!answer.trim()) return;
  //   setIsLoading(true);

  //   try {
  //     const submitResponse = await fetch("/api/interview/submit-answer", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         answer,
  //         question: questions[currentQuestionIndex],
  //       }),
  //     });

  //     if (!submitResponse.ok) {
  //       console.error("Failed to submit answer");
  //       setIsLoading(false);
  //       return;
  //     }
  //     if (currentQuestionIndex < 14) {
  //       let nextQuestion = "";
  //       if (currentQuestionIndex < 2) {
  //         nextQuestion = questions[currentQuestionIndex + 1] || "";
  //       } else {
  //         const dummyJobDescription =
  //           "This job requires expertise in full-stack development with experience in React and Django.";
  //         nextQuestion = await generateNextQuestion(
  //           dummyJobDescription,
  //           answer
  //         );
  //       }
  //       setQuestions((prev) => [...prev, nextQuestion]);
  //       setCurrentQuestionIndex((prev) => prev + 1);
  //     }
  //     //  else {
  //     //   const scoreResponse = await fetch("/api/interview/score", {
  //     //     method: "POST",
  //     //   });
  //     //   if (scoreResponse.ok) {
  //     //     navigate("/complete");
  //     //   }
  //     // }
  //   } catch (error) {
  //     console.error("Error during answer submission:", error);
  //   }

  //   setAnswer("");
  //   setIsLoading(false);
  // };
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

      if (currentQuestionIndex < 2) {
        nextQuestion = questions[currentQuestionIndex + 1] || "";
      } else if (currentQuestionIndex < 14) {
        const dummyJobDescription =
          "This job requires expertise in full-stack development with experience in React and Django.";
        nextQuestion = await generateNextQuestion(dummyJobDescription, answer);
      }

      // Only add next question if we're not at the last one
      if (currentQuestionIndex < 14) {
        setQuestions((prev) => [...prev, nextQuestion]);
        setCurrentQuestionIndex((prev) => prev + 1);
      }

      // Clear the answer for the next question
      setAnswer("");
    } catch (error) {
      console.error("Error during answer submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showWarning = !audioEnabled || !cameraEnabled;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Ready for Your Interview?
              </h1>
              <div className="space-y-4 text-gray-600">
                <p>This interview will contain 15 questions in total</p>
                <p>Estimated duration: 20-30 minutes</p>
                <div className="my-4">
                  <Progress value={0} className="h-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Stable internet connection</li>
                    <li>Webcam & microphone</li>
                    <li>Quiet environment</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Tips</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Dress professionally</li>
                    <li>Look directly at the camera</li>
                    <li>Speak clearly and concisely</li>
                  </ul>
                </div>
              </div>
              <Button
                size="lg"
                onClick={startInterview}
                disabled={isLoading}
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
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
          <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="w-1/3" /> {/* Empty for spacing left */}
              <div className="flex items-center gap-2 text-blue-600 justify-center w-1/3">
                <Video className="h-6 w-6" />
                <h1 className="text-2xl font-bold tracking-tight text-center">
                  AI-VIS Interview
                </h1>
              </div>
              <div className="w-1/3 flex justify-end">
                {/* Optional right-side controls like a timer, settings, or logout */}
                {/* <Button variant="ghost" className="text-sm">Logout</Button> */}
              </div>
            </div>
          </nav>

          <main className="flex-grow max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-6">
              <div className="relative bg-gray-200 aspect-video rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                {/* Video stream if camera is on */}
                {cameraEnabled && videoStream ? (
                  <video
                    ref={videoRef}
                    className="object-cover w-full h-full"
                    autoPlay
                    muted
                  />
                ) : (
                  // Placeholder with same dimensions
                  <span className="object-cover text-gray-700 text-lg">
                    Camera is Off
                  </span>
                )}

                {/* Toggle Controls */}
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <button
                    onClick={toggleCamera}
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100 focus:outline-none"
                    title="Toggle Camera"
                  >
                    {cameraEnabled ? (
                      <Video className="h-6 w-6 text-blue-600" />
                    ) : (
                      <VideoOff className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={toggleAudio}
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100 focus:outline-none"
                    title="Toggle Microphone"
                  >
                    {audioEnabled ? (
                      <Mic className="h-6 w-6 text-blue-600" />
                    ) : (
                      <MicOff className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {questions[currentQuestionIndex]}
                  </h3>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Type or edit your answer here..."
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            <aside className="flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
                <div
                  className={`mx-auto w-48 h-48 rounded-full p-1 mb-4 transition-all ${
                    isLoading ? "glow-border" : "border border-gray-300"
                  }`}
                >
                  <img
                    src={aibot}
                    alt="AI Interviewer"
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-semibold mb-2">AI Interviewer</h2>
                <div className="text-gray-600 text-center space-y-2">
                  <p>Analyzing your responses...</p>
                  <p>Generating next question...</p>
                </div>
                <div className="mt-4 p-2 bg-blue-50 rounded-md shadow-inner">
                  <span className="text-sm text-blue-800">
                    Question {currentQuestionIndex + 1} of 15
                  </span>
                </div>
              </div>

              {/* Submit Button moved here */}
              <Button
                onClick={handleAnswerSubmit}
                disabled={!answer.trim() || isLoading}
                className="w-full py-3 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : currentQuestionIndex < 14 ? (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit & Next Question
                  </>
                ) : (
                  "Complete Interview"
                )}
              </Button>
              {cameraEnabled && (
                <div className="px-4 py-4 bg-green-100 border border-green-300 text-green-800 rounded-md shadow text-sm font-medium">
                  🎥 Interview in Progress - Please stay focused and respond
                  clearly.
                </div>
              )}
              <div className="flex flex-col gap-4">
                {showWarning && (
                  <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-sm">
                    Warning: Please ensure your camera and microphone are
                    enabled.
                  </div>
                )}
                <Button
                  onClick={() => navigate("/complete")}
                  className="w-full py-3 bg-blue-600 hover:bg-green-700 text-white"
                  disabled={currentQuestionIndex < 14}
                >
                  Complete Interview
                </Button>
              </div>
            </aside>
          </main>
        </>
      )}
    </div>
  );
}

export default AIInterview;
