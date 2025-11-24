
export enum AppView {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  ROADMAP = 'ROADMAP',
  STUDY = 'STUDY',
  QUIZ = 'QUIZ',
  DASHBOARD = 'DASHBOARD',
  CERTIFICATE = 'CERTIFICATE'
}

export enum Language {
  PT = 'pt-BR',
  EN = 'en-US',
  ES = 'es-ES',
  ZH = 'zh-CN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LabContent {
  svgCode: string;
  experimentSteps: string;
}

export interface MultimediaContent {
  markdownContent: string;
  youtubeQueries: string[];
  infographicDescription: string;
  lab?: LabContent;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  isCompleted: boolean;
  content?: MultimediaContent; 
  quiz?: QuizQuestion[];
  quizScore?: number;
}

export interface StudyPlan {
  subject: string;
  dailyTime: string;
  totalDurationPrediction: string;
  modules: Module[];
  startDate: string;
  language: Language;
  totalSecondsStudied: number; // Novo campo para tempo real
}

export interface UserPreferences {
  darkMode: boolean;
  weeklyGoalHours: number;
  streakDays: number;
  lastStudyDate: string | null;
  language: Language;
}

export enum LoadingState {
  IDLE = 'IDLE',
  AUTH = 'AUTH',
  GENERATING_PLAN = 'GENERATING_PLAN',
  GENERATING_CONTENT = 'GENERATING_CONTENT',
  GENERATING_QUIZ = 'GENERATING_QUIZ',
  GENERATING_LAB = 'GENERATING_LAB',
  ERROR = 'ERROR'
}
