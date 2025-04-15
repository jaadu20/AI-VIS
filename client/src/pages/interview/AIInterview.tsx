import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Send,
  Loader2,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/progress";
import aibot from "../../assets/public/images/aibot.jpg";
import axios from "axios";

export function AIInterview() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    audioUrl: "",
    id: "",
    order: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mediaState, setMediaState] = useState({
    audio: true,
    video: true,
    recording: false,
  });
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startInterview = async () => {
    setShowPopup(false);
    try {
      const response = await axios.post("/api/interviews/", {
        job_description: "Sample job description",
      });
      loadNextQuestion(response.data.id);
    } catch (error) {
      console.error("Error starting interview:", error);
    }
  };

  const loadNextQuestion = async (interviewId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/generate-question/", {
        interview_id: interviewId,
        current_order: currentQuestion.order,
      });
      setCurrentQuestion({
        text: response.data.question,
        audioUrl: response.data.audio_url,
        id: response.data.id,
        order: response.data.order,
      });
      playQuestionAudio(response.data.audio_url);
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playQuestionAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch((error) => console.error("Audio play failed:", error));
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    mediaRecorder.current.start();
    setMediaState((prev) => ({ ...prev, recording: true }));
  };

  const stopRecording = async () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      const audioBlob = new Blob(audioChunks.current);
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("question_id", currentQuestion.id);

      try {
        const response = await axios.post("/api/process-answer/", formData);
        // Update UI with transcribed text
      } catch (error) {
        console.error("Error processing answer:", error);
      }

      setMediaState((prev) => ({ ...prev, recording: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            {/* Popup content with animations */}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <motion.div
            className="relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Video preview with animated controls */}
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {currentQuestion.text}
            </h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={mediaState.recording ? stopRecording : startRecording}
                className={`rounded-full p-4 transition-all ${
                  mediaState.recording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {mediaState.recording ? (
                  <Square className="h-6 w-6 text-white" />
                ) : (
                  <Mic className="h-6 w-6 text-white" />
                )}
              </Button>
              {mediaState.recording && (
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span>{recordingTime}s</span>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <aside className="flex flex-col gap-6">
          <motion.div
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-2xl"
            initial={{ x: 20 }}
            animate={{ x: 0 }}
          >
            <div className="flex flex-col items-center">
              <motion.img
                src={aibot}
                alt="AI Interviewer"
                className="w-32 h-32 rounded-full mb-4 ring-4 ring-blue-500"
                animate={{
                  rotate: isLoading ? [0, 10, -10, 0] : 0,
                  scale: isLoading ? 1.1 : 1,
                }}
                transition={{ duration: 0.5, loop: isLoading ? Infinity : 0 }}
              />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Interview Assistant
                </h2>
                <p className="text-gray-300">
                  {isLoading
                    ? "Analyzing your response..."
                    : "Ready for your answer"}
                </p>
              </div>
            </div>
          </motion.div>

          <Button
            onClick={() =>
              currentQuestion.order < 14
                ? loadNextQuestion()
                : navigate("/complete")
            }
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl transition-all"
          >
            {currentQuestion.order < 14
              ? "Next Question"
              : "Complete Interview"}
          </Button>
        </aside>
      </main>
    </div>
  );
}
