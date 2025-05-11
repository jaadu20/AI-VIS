import { X, Calendar, Video } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";

interface InterviewOptionsModal {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string, time: string) => void;
  onStartNow: () => void;
}

export function InterviewOptionsModal({ isOpen, onClose, onSchedule, onStartNow }: InterviewOptionsModal) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Available time slots
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  // Get next 7 days for scheduling
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      
      const formattedDate = nextDay.toISOString().split('T')[0];
      const dayName = nextDay.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = nextDay.getDate();
      const month = nextDay.toLocaleDateString('en-US', { month: 'short' });
      
      days.push({
        value: formattedDate,
        label: `${dayName}, ${month} ${dayNumber}`
      });
    }
    
    return days;
  };

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      onSchedule(selectedDate, selectedTime);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Interview Options</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Option 1: Start Now */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-blue-50 p-4 rounded-xl border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={onStartNow}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Start Interview Now</h4>
                    <p className="text-gray-600">Begin your AI-powered interview immediately</p>
                  </div>
                </div>
              </motion.div>

              {/* Option 2: Schedule */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-green-600 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Schedule for Later</h4>
                    <p className="text-gray-600">Book your interview at a convenient time</p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {getNextDays().map((day) => (
                        <motion.button
                          key={day.value}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2 rounded-lg text-center text-xs ${
                            selectedDate === day.value
                              ? "bg-green-600 text-white"
                              : "bg-white border border-gray-200 text-gray-700 hover:border-green-400"
                          }`}
                          onClick={() => setSelectedDate(day.value)}
                        >
                          <div className="font-medium">{day.label.split(",")[0]}</div>
                          <div>
                            {day.label.split(" ")[1]} {day.label.split(" ")[2]}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <motion.button
                            key={time}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2 rounded-lg text-center ${
                              selectedTime === time
                                ? "bg-green-600 text-white"
                                : "bg-white border border-gray-200 text-gray-700 hover:border-green-400"
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime}
                className={`${
                  selectedDate && selectedTime
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-200 cursor-not-allowed text-gray-500"
                }`}
              >
                Schedule Interview
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}