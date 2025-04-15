// src/store/interview-store.ts
import { create } from 'zustand';
import axios from 'axios';

interface Answer {
  question: string;
  answer: string;
  contentScore: number;
  voiceScore: number;
  facialScore: number;
}

interface InterviewState {
  interviewId: string | null;
  jobId: string | null;
  questions: string[];
  currentQuestion: number;
  answers: Answer[];
  voiceAnalysis: number[];
  facialAnalysis: number[];
  isLoading: boolean;
  error: string | null;
  startInterview: (jobId: string) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  completeInterview: () => Promise<void>;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  interviewId: null,
  jobId: null,
  questions: [],
  currentQuestion: 0,
  answers: [],
  voiceAnalysis: [],
  facialAnalysis: [],
  isLoading: false,
  error: null,

  startInterview: async (jobId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post('/api/interviews/start', { jobId });
      
      set({
        interviewId: response.data.interviewId,
        jobId,
        questions: response.data.questions,
        currentQuestion: 0,
        answers: [],
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to start interview', isLoading: false });
    }
  },

  submitAnswer: async (answer: string) => {
    try {
      set({ isLoading: true });
      const { interviewId, currentQuestion } = get();
      
      const response = await axios.post(`/api/interviews/${interviewId}/answer`, {
        questionIndex: currentQuestion,
        answer
      });

      set((state) => ({
        answers: [...state.answers, response.data.answer],
        questions: [...state.questions, response.data.nextQuestion],
        currentQuestion: state.currentQuestion + 1,
        voiceAnalysis: [...state.voiceAnalysis, response.data.voiceScore],
        facialAnalysis: [...state.facialAnalysis, response.data.facialScore],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to submit answer', isLoading: false });
    }
  },

  completeInterview: async () => {
    try {
      const { interviewId } = get();
      await axios.post(`/api/interviews/${interviewId}/complete`);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to complete interview', isLoading: false });
    }
  },

  reset: () => {
    set({
      interviewId: null,
      jobId: null,
      questions: [],
      currentQuestion: 0,
      answers: [],
      voiceAnalysis: [],
      facialAnalysis: [],
      error: null
    });
  }
}));