import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Video, Mic, MicOff, Upload } from "lucide-react"; // Importing Upload icon
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

type Message = {
  id: string;
  text?: string;
  audioUrl?: string;
  sender: "user" | "ai";
};

export function AIInterview() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI interviewer. Let's begin with your introduction.",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null); 
  const fileInputRef = useRef<HTMLInputElement | null>(null); 

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
    
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = () => {
          const fileContent = reader.result as string;

          
          const newMessage: Message = {
            id: Date.now().toString(),
            text: fileContent,
            sender: "user",
          };

          setMessages((prev) => [...prev, newMessage]); 
        };
        reader.readAsText(file);
      } else {
        alert("Please upload a valid .txt file.");
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
    
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
     
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaStream.current = stream;
          const recorder = new MediaRecorder(stream);
          mediaRecorder.current = recorder; 

          recorder.ondataavailable = (e) => {
            setAudioChunks((prev) => [...prev, e.data]);
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
            const audioUrl = URL.createObjectURL(audioBlob);

            const newMessage: Message = {
              id: Date.now().toString(),
              audioUrl,
              sender: "user",
            };

            setMessages((prev) => [...prev, newMessage]);
            setAudioChunks([]); 
          };

          recorder.start();
          setIsRecording(true);
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInput("");

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your response. Here's my next question...",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleComplete = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
    navigate("/student/dashboard");
  };

  const toggleVideo = async () => {
    if (!isVideoOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isMicOn,
        });
        mediaStream.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoOn(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    } else {
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
        mediaStream.current = null;
      }
      setIsVideoOn(false);
    }
  };

  const toggleMic = async () => {
    if (mediaStream.current) {
      const audioTracks = mediaStream.current.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !isMicOn));
    }
    setIsMicOn(!isMicOn);
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage:
          "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">AI VIS</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Video Interview
                </h2>
                <Button variant="outline" size="sm" onClick={toggleVideo}>
                  <Video className="h-5 w-5 mr-2" />
                  {isVideoOn ? "Stop Video" : "Start Video"}
                </Button>
              </div>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full rounded-lg"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={toggleMic}>
                  {isMicOn ? (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Mute
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow rounded-lg overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.audioUrl ? (
                        <audio controls src={message.audioUrl}></audio>
                      ) : (
                        message.text
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend}>
                  <Send className="h-5 w-5" />
                </Button>
                <Button
                  onClick={toggleRecording}
                  className={`${
                    isRecording ? "bg-red-500 text-white" : "bg-blue-600"
                  } p-2 rounded-full`}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Button
                    className="bg-blue-600 text-white p-2 rounded-full flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload File
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <Button onClick={handleComplete} variant="outline">
                  Complete Interview
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
