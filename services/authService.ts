import { User, UserPreferences, StudyPlan, Language } from "../types";

// Simulating a backend database in localStorage
const DB_USERS_KEY = 'mentoria_db_users';
const SESSION_KEY = 'mentoria_session_user_id';

const getDB = () => JSON.parse(localStorage.getItem(DB_USERS_KEY) || '[]');
const saveDB = (users: any[]) => localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));

// Helper to delay execution to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay(800); // Simulate network
    const users = getDB();
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) throw new Error("Invalid credentials");
    
    localStorage.setItem(SESSION_KEY, user.id);
    return { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    await delay(1000);
    const users = getDB();
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists");
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      password, // In a real app, never store plain text passwords
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    users.push(newUser);
    saveDB(users);
    localStorage.setItem(SESSION_KEY, newUser.id);

    return { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
  },

  async logout() {
    await delay(200);
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    
    const users = getDB();
    const user = users.find((u: any) => u.id === userId);
    return user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null;
  },

  // Per-user Data Persistence
  saveUserData(userId: string, data: { plan: StudyPlan | null, prefs: UserPreferences }) {
    localStorage.setItem(`mentoria_data_${userId}`, JSON.stringify(data));
  },

  getUserData(userId: string): { plan: StudyPlan | null, prefs: UserPreferences } {
    const data = localStorage.getItem(`mentoria_data_${userId}`);
    if (data) return JSON.parse(data);
    
    // Default data for new user
    return {
      plan: null,
      prefs: {
        darkMode: false,
        weeklyGoalHours: 5,
        streakDays: 0,
        lastStudyDate: null,
        language: Language.PT
      }
    };
  }
};