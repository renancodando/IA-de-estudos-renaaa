
import React, { useState, useEffect, useRef } from 'react';
import { 
  AppView, 
  LoadingState, 
  StudyPlan, 
  Module, 
  UserPreferences,
  User,
  Language
} from './types';
import { 
  generateStudyPlan, 
  generateModuleContent, 
  generateQuiz,
  generateLabContent 
} from './services/geminiService';
import { authService } from './services/authService';
import { t } from './services/translations';
import { 
  BookOpenIcon, 
  CheckCircleIcon, 
  LockIcon, 
  PlayIcon, 
  BrainIcon, 
  ChevronLeftIcon,
  ClockIcon,
  FlaskIcon,
  AwardIcon,
  PrinterIcon,
  XIcon
} from './components/Icons';

// --- Icons ---
const BarChartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);
const SunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);
const MoonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);
const ImageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
const LogoutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const GlobeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

// --- Helper Components ---

const MarkdownContent = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200 leading-relaxed animate-fade-in">
      {lines.map((line, idx) => {
        if (line.startsWith('###')) return <h3 key={idx} className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-6">{line.replace('###', '')}</h3>;
        if (line.startsWith('##')) return <h2 key={idx} className="text-2xl font-bold text-slate-900 dark:text-white mt-8 pb-2 border-b border-slate-200 dark:border-slate-700">{line.replace('##', '')}</h2>;
        if (line.startsWith('#')) return <h1 key={idx} className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">{line.replace('#', '')}</h1>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc text-slate-700 dark:text-slate-300">{line.replace(/[-*] /, '')}</li>;
        if (line.trim() === '') return <div key={idx} className="h-2"></div>;
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} className="text-lg">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

const Modal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText, 
  cancelText 
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
  confirmText: string; 
  cancelText: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
         <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
         <div className="flex gap-3 justify-end">
            <button 
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow transition"
            >
              {confirmText}
            </button>
         </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.AUTH);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inputs
  const [subject, setSubject] = useState('');
  const [timeAvailable, setTimeAvailable] = useState('');

  // Data
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  
  // User Preferences
  const [prefs, setPrefs] = useState<UserPreferences>({
    darkMode: false,
    weeklyGoalHours: 5,
    streakDays: 0,
    lastStudyDate: null,
    language: Language.PT
  });

  // Auth Inputs
  const [isLogin, setIsLogin] = useState(true);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Multimedia Tab State
  const [activeTab, setActiveTab] = useState<'text' | 'video' | 'visual' | 'lab'>('text');

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ isOpen: false, title: '', message: '', action: () => {} });

  // Initial Load (Check Session)
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.id);
    } else {
      setView(AppView.AUTH);
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (view === AppView.STUDY && studyPlan) {
      interval = setInterval(() => {
        setStudyPlan(prev => {
           if(!prev) return null;
           return { ...prev, totalSecondsStudied: (prev.totalSecondsStudied || 0) + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  const loadUserData = (userId: string) => {
    const data = authService.getUserData(userId);
    setPrefs(data.prefs);
    setStudyPlan(data.plan);
    
    if (data.prefs.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    if (data.plan) setView(AppView.ROADMAP);
    else setView(AppView.ONBOARDING);
  };

  // Save on change
  useEffect(() => {
    if (user) {
      authService.saveUserData(user.id, { plan: studyPlan, prefs });
    }
  }, [studyPlan, prefs, user]);

  const toggleTheme = () => {
    setPrefs(p => {
      const newVal = !p.darkMode;
      if (newVal) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { ...p, darkMode: newVal };
    });
  };

  const changeLanguage = (lang: Language) => {
    setPrefs(p => ({ ...p, language: lang }));
  };

  // Modal Handlers
  const confirmLogout = () => {
    setModalConfig({
      isOpen: true,
      title: t('logout_confirm', prefs.language),
      message: t('logout_confirm', prefs.language),
      action: async () => {
        await authService.logout();
        setUser(null);
        setStudyPlan(null);
        setView(AppView.AUTH);
        document.documentElement.classList.remove('dark');
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const confirmEndCourse = () => {
     setModalConfig({
      isOpen: true,
      title: t('exit_course', prefs.language),
      message: t('exit_course_confirm', prefs.language),
      action: () => {
        setStudyPlan(null);
        setView(AppView.ONBOARDING);
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(LoadingState.AUTH);
    setErrorMsg(null);

    try {
      let loggedUser;
      if (isLogin) {
        loggedUser = await authService.login(authEmail, authPassword);
      } else {
        loggedUser = await authService.signup(authName, authEmail, authPassword);
      }
      setUser(loggedUser);
      loadUserData(loggedUser.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(LoadingState.IDLE);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !timeAvailable) return;

    setLoading(LoadingState.GENERATING_PLAN);
    setErrorMsg(null);
    try {
      const plan = await generateStudyPlan(subject, timeAvailable, prefs.language);
      setStudyPlan(plan);
      setView(AppView.ROADMAP);
    } catch (err) {
      setErrorMsg(t('error_plan', prefs.language));
    } finally {
      setLoading(LoadingState.IDLE);
    }
  };

  const handleStartModule = async (module: Module) => {
    setCurrentModule(module);
    setActiveTab('text');
    setLoading(LoadingState.GENERATING_CONTENT);
    setView(AppView.STUDY);
    
    if (!module.content) {
      try {
        const content = await generateModuleContent(studyPlan!.subject, module.title, prefs.language);
        const updatedModule = { ...module, content };
        setCurrentModule(updatedModule);
        updateModuleInPlan(updatedModule);
      } catch (err) {
        setErrorMsg(t('error_content', prefs.language));
      }
    }
    setLoading(LoadingState.IDLE);
  };

  const handleLoadLab = async () => {
    if (!currentModule || !currentModule.content) return;
    if (currentModule.content.lab) {
      setActiveTab('lab');
      return;
    }

    setLoading(LoadingState.GENERATING_LAB);
    try {
      const labData = await generateLabContent(studyPlan!.subject, currentModule.title, prefs.language);
      const updatedContent = { ...currentModule.content, lab: labData };
      const updatedModule = { ...currentModule, content: updatedContent };
      setCurrentModule(updatedModule);
      updateModuleInPlan(updatedModule);
      setActiveTab('lab');
    } catch (e) {
      console.error(e);
      // Fallback
      setActiveTab('text');
    } finally {
      setLoading(LoadingState.IDLE);
    }
  };

  const handleStartQuiz = async () => {
    if (!currentModule) return;
    setLoading(LoadingState.GENERATING_QUIZ);
    
    try {
      if (!currentModule.quiz) {
        const quiz = await generateQuiz(studyPlan!.subject, currentModule.title, prefs.language);
        const updatedModule = { ...currentModule, quiz };
        setCurrentModule(updatedModule);
        updateModuleInPlan(updatedModule);
      }
      setQuizAnswers([]);
      setShowQuizResults(false);
      setView(AppView.QUIZ);
    } catch (err) {
      setErrorMsg(t('error_quiz', prefs.language));
    } finally {
      setLoading(LoadingState.IDLE);
    }
  };

  const updateModuleInPlan = (updatedModule: Module) => {
    if (!studyPlan) return;
    const updatedModules = studyPlan.modules.map(m => 
      m.id === updatedModule.id ? updatedModule : m
    );
    setStudyPlan({ ...studyPlan, modules: updatedModules });
  };

  const handleFinishModule = (score: number) => {
    if (!currentModule) return;
    
    const today = new Date().toISOString().split('T')[0];
    let newStreak = prefs.streakDays;
    if (prefs.lastStudyDate !== today) {
        newStreak = (prefs.lastStudyDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) 
          ? newStreak + 1 
          : 1;
        setPrefs(p => ({ ...p, streakDays: newStreak, lastStudyDate: today }));
    }

    const completedModule = { 
      ...currentModule, 
      isCompleted: true,
      quizScore: score
    };
    updateModuleInPlan(completedModule);
    setView(AppView.ROADMAP);
  };

  const calculateProgress = () => {
    if (!studyPlan) return { completed: 0, total: 0, percent: 0, avgScore: 0 };
    const completed = studyPlan.modules.filter(m => m.isCompleted).length;
    const total = studyPlan.modules.length;
    const totalScore = studyPlan.modules.reduce((acc, m) => acc + (m.quizScore || 0), 0);
    const avgScore = completed > 0 ? Math.round((totalScore / completed) * 100) : 0;
    
    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
      avgScore
    };
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // --- Views ---

  const renderAuth = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-900 animate-fade-in transition-colors">
      <div className="absolute top-4 right-4 flex gap-2">
         <select 
            value={prefs.language} 
            onChange={(e) => changeLanguage(e.target.value as Language)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-700 dark:text-white outline-none"
         >
           <option value={Language.PT}>🇵🇹 PT</option>
           <option value={Language.EN}>🇺🇸 EN</option>
           <option value={Language.ES}>🇪🇸 ES</option>
           <option value={Language.ZH}>🇨🇳 ZH</option>
         </select>
         <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-800 shadow text-slate-600 dark:text-yellow-300">
          {prefs.darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
           <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 text-white">
             <BrainIcon className="w-8 h-8" />
           </div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('app_name', prefs.language)}</h1>
           <p className="text-slate-500 dark:text-slate-400">{t('tagline', prefs.language)}</p>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white">
          {isLogin ? t('login_title', prefs.language) : t('signup_title', prefs.language)}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('name_label', prefs.language)}</label>
              <input 
                type="text" 
                value={authName}
                onChange={e => setAuthName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('email_label', prefs.language)}</label>
            <input 
              type="email" 
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('password_label', prefs.language)}</label>
            <input 
              type="password" 
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading === LoadingState.AUTH}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-70 flex justify-center"
          >
            {loading === LoadingState.AUTH ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (isLogin ? t('login_btn', prefs.language) : t('signup_btn', prefs.language))}
          </button>
        </form>

        {errorMsg && <p className="text-red-500 text-center mt-4 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{errorMsg}</p>}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
            {isLogin ? t('switch_to_signup', prefs.language) : t('switch_to_login', prefs.language)}
          </button>
        </p>
      </div>
    </div>
  );

  const renderOnboarding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 animate-fade-in relative">
      <div className="absolute top-4 right-4 flex gap-2">
         <select 
            value={prefs.language} 
            onChange={(e) => changeLanguage(e.target.value as Language)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-700 dark:text-white outline-none"
         >
           <option value={Language.PT}>🇵🇹 PT</option>
           <option value={Language.EN}>🇺🇸 EN</option>
           <option value={Language.ES}>🇪🇸 ES</option>
           <option value={Language.ZH}>🇨🇳 ZH</option>
         </select>
         <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-lg text-slate-600 dark:text-yellow-300 transition-transform hover:scale-110"
         >
            {prefs.darkMode ? <SunIcon /> : <MoonIcon />}
         </button>
         <button 
            onClick={confirmLogout}
            className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
         >
            <LogoutIcon />
         </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 animate-slide-up">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
            <BrainIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-300" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">{t('app_name', prefs.language)}</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t('tagline', prefs.language)}</p>
        
        <form onSubmit={handleGeneratePlan} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('what_to_learn', prefs.language)}</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('placeholder_subject', prefs.language)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('time_available', prefs.language)}</label>
            <select 
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            >
              <option value="">{t('select_time', prefs.language)}</option>
              <option value={`15 ${t('minutes', prefs.language)}`}>15 {t('minutes', prefs.language)}</option>
              <option value={`30 ${t('minutes', prefs.language)}`}>30 {t('minutes', prefs.language)}</option>
              <option value={`1 ${t('hour', prefs.language)}`}>1 {t('hour', prefs.language)}</option>
              <option value={`2 ${t('hours', prefs.language)}`}>2 {t('hours', prefs.language)}</option>
              <option value={`4 ${t('hours_plus', prefs.language)}`}>4 {t('hours_plus', prefs.language)}</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading !== LoadingState.IDLE}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition flex justify-center items-center disabled:opacity-70"
          >
            {loading === LoadingState.GENERATING_PLAN ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('btn_generating', prefs.language)}
              </>
            ) : t('btn_generate', prefs.language)}
          </button>
        </form>
        {errorMsg && <p className="text-red-500 text-center mt-4 text-sm">{errorMsg}</p>}
      </div>
    </div>
  );
  
  const renderDashboard = () => {
    const stats = calculateProgress();
    
    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden animate-fade-in">
        <header className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setView(AppView.ROADMAP)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                <ChevronLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </button>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('dashboard_title', prefs.language)}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-yellow-300">
                {prefs.darkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Streak & Goals Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                       <div className="relative z-10">
                           <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">{t('streak_title', prefs.language)}</p>
                           <h2 className="text-5xl font-bold mb-2">{prefs.streakDays} <span className="text-2xl font-normal">{t('days', prefs.language)}</span></h2>
                           <p className="text-indigo-100 text-sm">{t('streak_msg', prefs.language)}</p>
                           <div className="mt-4 text-xs font-mono bg-white/20 inline-block px-2 py-1 rounded">
                             {t('real_time_studied', prefs.language)}: {formatTime(studyPlan?.totalSecondsStudied || 0)}
                           </div>
                       </div>
                       <BrainIcon className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
                   </div>

                   <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                       <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('weekly_goal', prefs.language)}</h3>
                       <div className="flex items-end gap-2 mb-2">
                          <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.completed}</span>
                          <span className="text-slate-500 dark:text-slate-400 mb-1">/ {prefs.weeklyGoalHours}</span>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-4">
                          <div 
                             className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                             style={{ width: `${Math.min(100, (stats.completed / prefs.weeklyGoalHours) * 100)}%` }}
                          ></div>
                       </div>
                       <input 
                         type="range" 
                         min="1" max="20" 
                         value={prefs.weeklyGoalHours}
                         onChange={(e) => setPrefs({...prefs, weeklyGoalHours: parseInt(e.target.value)})}
                         className="w-full mt-2 accent-indigo-600"
                       />
                   </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                       <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                          <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                       </div>
                       <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats.completed}</span>
                       <span className="text-sm text-slate-500 dark:text-slate-400 text-center">{t('modules_completed', prefs.language)}</span>
                   </div>
                   
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                       <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-3">
                          <BrainIcon className="w-8 h-8 text-orange-600 dark:text-orange-300" />
                       </div>
                       <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats.avgScore}%</span>
                       <span className="text-sm text-slate-500 dark:text-slate-400 text-center">{t('avg_score', prefs.language)}</span>
                   </div>

                   <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                       <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-3">
                          <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-300" />
                       </div>
                       <span className="text-3xl font-bold text-slate-800 dark:text-white">{studyPlan?.totalDurationPrediction}</span>
                       <span className="text-sm text-slate-500 dark:text-slate-400 text-center">{t('total_est', prefs.language)}</span>
                   </div>
                </div>
                
                {/* Course Details List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-bold text-slate-800 dark:text-white">{t('modules_detail', prefs.language)}</h3>
                   </div>
                   <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {studyPlan?.modules.map((mod, idx) => (
                        <div key={mod.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${mod.isCompleted ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                              <span className={`text-sm font-medium ${mod.isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {mod.title}
                              </span>
                           </div>
                           <div className="flex items-center gap-4">
                              {mod.isCompleted && mod.quizScore !== undefined && (
                                <span className={`text-xs px-2 py-1 rounded font-bold ${mod.quizScore >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                   {Math.round(mod.quizScore * 100) / 100}%
                                </span>
                              )}
                              {mod.isCompleted ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              ) : (
                                <span className="text-xs text-slate-400">{mod.estimatedHours}h</span>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

            </div>
        </main>
      </div>
    );
  };

  const renderRoadmap = () => {
    if (!studyPlan) return null;
    const stats = calculateProgress();
    const isAllCompleted = stats.percent === 100;

    return (
      <div className="h-screen flex bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex animate-fade-in">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate" title={studyPlan.subject}>{studyPlan.subject}</h2>
            <div className="flex items-center justify-between mt-3">
               <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>{studyPlan.totalDurationPrediction}</span>
               </div>
               <button onClick={toggleTheme} className="text-slate-400 hover:text-indigo-500">
                  {prefs.darkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
               </button>
            </div>
            
            {/* Mini Progress */}
            <div className="mt-4">
               <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${stats.percent}%` }}></div>
               </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
             <div className="space-y-4">
               {studyPlan.modules.map((mod, idx) => (
                 <div key={mod.id} className={`p-3 rounded-lg border transition-colors ${mod.isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">#{idx + 1}</span>
                     {mod.isCompleted && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                   </div>
                   <p className={`text-sm font-medium truncate ${mod.isCompleted ? 'text-green-800 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>{mod.title}</p>
                 </div>
               ))}
             </div>
          </div>
          
          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2 px-2">
              <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-200" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{user?.name}</span>
            </div>
            {isAllCompleted && (
              <button
                onClick={() => setView(AppView.CERTIFICATE)}
                className="flex items-center justify-center w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-bold shadow hover:shadow-lg transition"
              >
                <AwardIcon className="w-4 h-4 mr-2" /> {t('certificate_btn', prefs.language)}
              </button>
            )}
            <button 
              onClick={() => setView(AppView.DASHBOARD)} 
              className="flex items-center justify-center w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              <BarChartIcon className="w-4 h-4 mr-2" /> {t('dashboard_title', prefs.language)}
            </button>
            <button onClick={confirmEndCourse} className="text-xs text-slate-400 hover:text-red-500 text-center mt-1">
              {t('exit_course', prefs.language)}
            </button>
            <button onClick={confirmLogout} className="text-xs text-slate-400 hover:text-red-500 text-center">
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{studyPlan.subject}</h1>
                <p className="text-slate-600 dark:text-slate-400">Language: {prefs.language.toUpperCase()}</p>
              </div>
              <div className="md:hidden">
                 <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                    {prefs.darkMode ? <SunIcon className="text-white"/> : <MoonIcon className="text-slate-800"/>}
                 </button>
              </div>
            </header>

            <div className="space-y-6">
              {studyPlan.modules.map((mod, idx) => {
                const isLocked = idx > 0 && !studyPlan.modules[idx - 1].isCompleted;
                
                return (
                  <div key={mod.id} className={`relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border transition-all animate-slide-up ${isLocked ? 'border-slate-100 dark:border-slate-700 opacity-60' : 'border-slate-200 dark:border-slate-600 hover:shadow-md dark:hover:shadow-slate-700/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded uppercase tracking-wide">#{idx + 1}</span>
                          <span className="text-slate-400 text-sm flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" /> {mod.estimatedHours}h
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{mod.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">{mod.description}</p>
                        
                        {!isLocked && !mod.isCompleted && (
                          <button 
                            onClick={() => handleStartModule(mod)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition text-sm shadow-md hover:shadow-lg"
                          >
                            <PlayIcon className="w-4 h-4 mr-2" /> {t('start_study', prefs.language)}
                          </button>
                        )}
                         {mod.isCompleted && (
                          <div className="flex gap-3">
                            <button 
                               onClick={() => handleStartModule(mod)}
                               className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg font-medium transition text-sm border border-green-200 dark:border-green-800"
                             >
                              <BookOpenIcon className="w-4 h-4 mr-2" /> {t('review', prefs.language)}
                             </button>
                             {mod.quizScore !== undefined && (
                                <span className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">
                                   Score: {Math.round(mod.quizScore * 100) / 100}%
                                </span>
                             )}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {mod.isCompleted ? (
                           <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                             <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                           </div>
                        ) : isLocked ? (
                          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <LockIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border-2 border-indigo-100 dark:border-indigo-800 relative">
                             <div className="absolute inset-0 rounded-full animate-ping bg-indigo-200 dark:bg-indigo-700 opacity-20"></div>
                             <PlayIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
             <div className="mt-8 text-center md:hidden pb-10 flex flex-col gap-3">
                 {isAllCompleted && (
                    <button
                    onClick={() => setView(AppView.CERTIFICATE)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-white rounded-lg shadow"
                    >
                      <AwardIcon className="w-4 h-4 mr-2" /> {t('certificate_btn', prefs.language)}
                    </button>
                 )}
                 <button 
                   onClick={() => setView(AppView.DASHBOARD)} 
                   className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-lg shadow"
                 >
                    <BarChartIcon className="w-4 h-4 mr-2" /> {t('dashboard_title', prefs.language)}
                 </button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudyMode = () => {
    if (!currentModule) return null;

    if (loading === LoadingState.GENERATING_CONTENT || loading === LoadingState.GENERATING_LAB) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-slate-900 animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400 mb-4"></div>
          <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">
            {loading === LoadingState.GENERATING_LAB ? t('loading_lab', prefs.language) : t('loading_content', prefs.language)}
          </h2>
        </div>
      );
    }

    return (
      <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center">
            <button onClick={() => setView(AppView.ROADMAP)} className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
              <ChevronLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-xs">{currentModule.title}</h1>
              <span className="text-xs text-indigo-500 font-mono">
                {t('real_time_studied', prefs.language)}: {formatTime(studyPlan?.totalSecondsStudied || 0)}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleStartQuiz}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
             >
               <BrainIcon className="w-4 h-4 mr-2" /> {t('take_quiz', prefs.language)}
             </button>
          </div>
        </header>

        {/* Multimedia Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-8 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('text')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'text' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <BookOpenIcon className="w-4 h-4 mr-2" /> {t('tab_read', prefs.language)}
            </button>
            <button 
              onClick={() => setActiveTab('video')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'video' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <YoutubeIcon className="w-4 h-4 mr-2" /> {t('tab_video', prefs.language)}
            </button>
             <button 
              onClick={() => setActiveTab('visual')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'visual' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <ImageIcon className="w-4 h-4 mr-2" /> {t('tab_visual', prefs.language)}
            </button>
            <button 
              onClick={handleLoadLab}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'lab' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <FlaskIcon className="w-4 h-4 mr-2" /> {t('tab_lab', prefs.language)}
            </button>
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-8 py-12">
             
             {activeTab === 'text' && (
               <article className="prose prose-slate dark:prose-invert prose-lg max-w-none animate-fade-in">
                  {currentModule.content && typeof currentModule.content !== 'string' 
                    ? <MarkdownContent content={currentModule.content.markdownContent} />
                    : <MarkdownContent content={typeof currentModule.content === 'string' ? currentModule.content : ''} />
                  }
               </article>
             )}

             {activeTab === 'video' && currentModule.content && typeof currentModule.content !== 'string' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid gap-4">
                      {currentModule.content.youtubeQueries.map((query, i) => (
                        <a 
                          key={i}
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 hover:shadow-lg transition group"
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                                    <YoutubeIcon />
                                 </div>
                                 <div>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">YouTube</p>
                                   <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">"{query}"</h3>
                                 </div>
                              </div>
                              <ChevronLeftIcon className="rotate-180 w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-red-500" />
                           </div>
                        </a>
                      ))}
                    </div>
                </div>
             )}

             {activeTab === 'visual' && currentModule.content && typeof currentModule.content !== 'string' && (
                <div className="animate-fade-in">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 border-2 border-dashed border-indigo-200 dark:border-slate-600 rounded-xl p-8 text-center">
                       <h2 className="text-2xl font-bold text-indigo-900 dark:text-white mb-8">Infographic</h2>
                       <div className="text-left prose prose-indigo dark:prose-invert max-w-none">
                          <MarkdownContent content={currentModule.content.infographicDescription} />
                       </div>
                    </div>
                </div>
             )}
             
             {activeTab === 'lab' && currentModule.content && currentModule.content.lab && (
               <div className="animate-fade-in space-y-8">
                 <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
                       <FlaskIcon className="w-6 h-6 mr-2" /> Virtual Lab Experiment
                    </h2>
                    <div className="flex justify-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                       <div 
                         className="w-full max-w-md"
                         dangerouslySetInnerHTML={{ __html: currentModule.content.lab.svgCode }} 
                       />
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                       <MarkdownContent content={currentModule.content.lab.experimentSteps} />
                    </div>
                 </div>
               </div>
             )}

             <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 flex justify-center pb-12">
                <button 
                  onClick={handleStartQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform flex items-center"
                >
                  {t('take_quiz', prefs.language)} <ChevronLeftIcon className="ml-2 w-5 h-5 rotate-180" />
                </button>
             </div>
          </div>
        </main>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!currentModule || !currentModule.quiz) {
       if (loading === LoadingState.GENERATING_QUIZ) {
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400 mb-4"></div>
            <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">{t('loading_quiz', prefs.language)}</h2>
          </div>
        );
       }
       return null;
    }

    const questions = currentModule.quiz;
    const score = quizAnswers.reduce((acc, ans, idx) => ans === questions[idx].correctIndex ? acc + 1 : acc, 0);
    const passed = score >= Math.ceil(questions.length * 0.7); // 70% to pass
    const percentage = (score / questions.length) * 100;

    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <header className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
             <button onClick={() => setView(AppView.STUDY)} className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center text-sm font-medium transition">
               <ChevronLeftIcon className="w-4 h-4 mr-1" /> {t('review', prefs.language)}
             </button>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('quiz_title', prefs.language)}</h2>
             <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="max-w-2xl mx-auto pb-10">
            <div className="space-y-8">
              {questions.map((q, qIdx) => {
                const userAnswer = quizAnswers[qIdx];
                const isCorrect = userAnswer === q.correctIndex;

                return (
                  <div key={qIdx} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-slide-up" style={{ animationDelay: `${qIdx * 100}ms` }}>
                    <div className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                        {qIdx + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">{q.question}</h3>
                    </div>
                    
                    <div className="space-y-3 ml-12">
                      {q.options.map((opt, oIdx) => {
                        let btnClass = "w-full text-left p-4 rounded-lg border transition-all text-sm md:text-base ";
                        
                        if (showQuizResults) {
                          if (oIdx === q.correctIndex) btnClass += "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300 font-medium";
                          else if (userAnswer === oIdx) btnClass += "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300";
                          else btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50";
                        } else {
                          if (userAnswer === oIdx) btnClass += "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500";
                          else btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={showQuizResults}
                            onClick={() => {
                              const newAnswers = [...quizAnswers];
                              newAnswers[qIdx] = oIdx;
                              setQuizAnswers(newAnswers);
                            }}
                            className={btnClass}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {showQuizResults && (
                      <div className={`mt-4 ml-12 p-4 rounded-lg text-sm ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                        <p className="font-bold mb-1 flex items-center">
                          {isCorrect ? <CheckCircleIcon className="w-4 h-4 mr-2"/> : "Incorrect."} 
                          {isCorrect ? 'Correct!' : 'Explanation:'}
                        </p>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              {!showQuizResults ? (
                <button 
                  onClick={() => setShowQuizResults(true)}
                  disabled={quizAnswers.length < questions.length}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95"
                >
                  {t('check_answers', prefs.language)}
                </button>
              ) : (
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 animate-slide-up">
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">Score: {score} / {questions.length}</p>
                  {passed ? (
                    <div>
                      <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">{t('congrats', prefs.language)}</h3>
                      <button 
                        onClick={() => handleFinishModule(percentage)}
                        className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition"
                      >
                        {t('continue_btn', prefs.language)} <ChevronLeftIcon className="w-5 h-5 ml-2 rotate-180" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">{t('try_again', prefs.language)}</h3>
                      <button 
                        onClick={() => {
                          setShowQuizResults(false);
                          setQuizAnswers([]);
                          setView(AppView.STUDY);
                        }}
                        className="px-6 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg font-bold transition"
                      >
                        {t('review_btn', prefs.language)}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificate = () => {
     if (!studyPlan || !user) return null;
     const stats = calculateProgress();
     
     return (
       <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 p-12 rounded-lg shadow-2xl max-w-4xl w-full relative animate-fade-in border-[16px] border-double border-slate-200">
             <button onClick={() => setView(AppView.ROADMAP)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 print:hidden">
               <XIcon className="w-6 h-6" />
             </button>
             <button onClick={() => window.print()} className="absolute top-4 right-4 p-2 text-indigo-600 hover:text-indigo-800 flex items-center gap-2 print:hidden">
               <PrinterIcon className="w-6 h-6" /> {t('print', prefs.language)}
             </button>

             <div className="text-center space-y-8 border-4 border-indigo-900 p-8 h-full">
                <div className="flex justify-center">
                   <BrainIcon className="w-20 h-20 text-indigo-900" />
                </div>
                <h1 className="text-5xl font-serif text-indigo-900 uppercase tracking-widest">{t('certificate_title', prefs.language)}</h1>
                <p className="text-xl text-slate-600 italic">{t('certified_text', prefs.language)}</p>
                
                <h2 className="text-4xl font-bold text-slate-900 border-b-2 border-slate-300 pb-4 inline-block px-12">
                   {user.name}
                </h2>
                
                <p className="text-xl text-slate-600">{t('completed_course', prefs.language)}</p>
                <h3 className="text-3xl font-bold text-indigo-700">{studyPlan.subject}</h3>

                <div className="grid grid-cols-3 gap-8 mt-12 text-left max-w-2xl mx-auto">
                   <div>
                      <p className="text-sm text-slate-500 uppercase tracking-wide">{t('real_time_studied', prefs.language)}</p>
                      <p className="text-2xl font-bold">{formatTime(studyPlan.totalSecondsStudied || 0)}</p>
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 uppercase tracking-wide">{t('final_score', prefs.language)}</p>
                      <p className="text-2xl font-bold">{stats.avgScore}%</p>
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 uppercase tracking-wide">{t('date', prefs.language)}</p>
                      <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="mt-16 pt-8 flex justify-center items-end gap-20">
                    <div className="text-center">
                       <div className="w-48 border-b border-slate-400 mb-2"></div>
                       <p className="text-sm text-slate-500">MentorIA AI Instructor</p>
                    </div>
                    <div className="w-24 h-24 relative">
                       <AwardIcon className="w-24 h-24 text-yellow-500 absolute top-0 left-0 opacity-20" />
                       <div className="absolute inset-0 flex items-center justify-center font-bold text-yellow-700 rotate-12 border-4 border-yellow-500 rounded-full text-xs uppercase p-2">
                          Official<br/>Certified
                       </div>
                    </div>
                </div>
             </div>
          </div>
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .bg-slate-800 { background: white !important; }
              .print\\:hidden { display: none !important; }
              .max-w-4xl { max-width: 100% !important; box-shadow: none !important; }
              .animate-fade-in { visibility: visible !important; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
              .animate-fade-in * { visibility: visible !important; }
            }
          `}</style>
       </div>
     );
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Modal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.action}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        confirmText={t('confirm', prefs.language)}
        cancelText={t('cancel', prefs.language)}
      />
      {view === AppView.AUTH && renderAuth()}
      {view === AppView.ONBOARDING && renderOnboarding()}
      {view === AppView.ROADMAP && renderRoadmap()}
      {view === AppView.DASHBOARD && renderDashboard()}
      {view === AppView.STUDY && renderStudyMode()}
      {view === AppView.QUIZ && renderQuiz()}
      {view === AppView.CERTIFICATE && renderCertificate()}
    </div>
  );
}