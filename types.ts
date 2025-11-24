export enum AppView {
  ONBOARDING = 'ONBOARDING',
  ROADMAP = 'ROADMAP',
  STUDY = 'STUDY',
  QUIZ = 'QUIZ',
  DASHBOARD = 'DASHBOARD'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MultimediaContent {
  markdownContent: string; // The main text
  youtubeQueries: string[]; // Keywords to search for videos
  infographicDescription: string; // Text description of a visual aid
}

export interface Module {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  isCompleted: boolean;
  content?: MultimediaContent; 
  quiz?: QuizQuestion[];
  quizScore?: number; // percentage 0-100
}

export interface StudyPlan {
  subject: string;
  dailyTime: string;
  totalDurationPrediction: string;
  modules: Module[];
  startDate: string;
}

export interface UserPreferences {
  darkMode: boolean;
  weeklyGoalHours: number;
  streakDays: number;
  lastStudyDate: string | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_PLAN = 'GENERATING_PLAN',
  GENERATING_CONTENT = 'GENERATING_CONTENT',
  GENERATING_QUIZ = 'GENERATING_QUIZ',
  ERROR = 'ERROR'
}