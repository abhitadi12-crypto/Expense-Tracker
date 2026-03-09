import React, { useState, useEffect } from "react";
import { Receipt, Plus, Menu } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";

// Services
import { apiService } from "./services/api";

// Components
import { Sidebar } from "./components/Sidebar";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { Expenses } from "./pages/Expenses";
import { Analytics } from "./pages/Analytics";
import { Insights } from "./pages/Insights";
import { Settings } from "./pages/Settings";
import { VoiceInput } from "./pages/VoiceInput";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useExpenses } from "./hooks/useExpenses";

/**
 * Main Application Component
 * Manages routing and layout
 */
export default function App() {
  // State for navigation and sidebar
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Custom hooks for logic
  const { user, loading: authLoading, login, loginWithGoogle, logout, updateProfile } = useAuth();
  const { 
    expenses, 
    insights, 
    loading: expensesLoading, 
    addExpense, 
    removeExpense,
    refreshInsights 
  } = useExpenses(user?.id);

  // Listen for Google Auth success
  useEffect(() => {
    const handleMessage = (event) => {
      // Validate origin
      if (!event.origin.endsWith(".run.app") && !event.origin.includes("localhost")) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        loginWithGoogle(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loginWithGoogle]);

  /**
   * Handle login form submission
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const email = e.target.email.value;
    const password = e.target.password.value || "password";
    
    if (!email) {
      setLoginError("Please enter an email address.");
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setLoginError("Login failed. Please check your connection and try again.");
    }
  };

  /**
   * Skip login and use as guest
   */
  const handleSkipLogin = async () => {
    setLoginError("");
    const success = await login("guest@example.com", "guest-password");
    if (!success) {
      setLoginError("Failed to start guest session. Please try again.");
    }
  };

  /**
   * Handle Google Login
   */
  const handleGoogleLogin = async () => {
    try {
      const { url } = await apiService.getGoogleAuthUrl();
      window.open(url, 'google_oauth', 'width=600,height=700');
    } catch (err) {
      console.error("Google Auth URL error:", err);
      setLoginError("Failed to start Google login. Please try again.");
    }
  };

  /**
   * Handle saving a new expense from voice input
   */
  const handleSaveExpense = async (parsedData, rawText) => {
    const success = await addExpense({ ...parsedData, raw_text: rawText });
    if (success) {
      setActivePage("dashboard");
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
              <Receipt className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Expense-Tracker</h1>
            <p className="text-slate-500 mt-2">Your AI-powered expense companion</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-in fade-in slide-in-from-top-2">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                placeholder="hello@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full mt-6 flex items-center justify-center gap-3 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>

          <button 
            onClick={handleSkipLogin}
            className="w-full mt-3 flex items-center justify-center gap-3 text-slate-500 hover:text-indigo-600 transition-all text-sm font-medium"
          >
            Skip login and use as Guest
          </button>
        </motion.div>
      </div>
    );
  }

  /**
   * Render the active page content
   */
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard expenses={expenses} setActivePage={setActivePage} />;
      case "expenses":
        return <Expenses expenses={expenses} onDelete={removeExpense} />;
      case "analytics":
        return <Analytics expenses={expenses} />;
      case "insights":
        return <Insights insights={insights} onRefresh={refreshInsights} />;
      case "settings":
        return <Settings user={user} onUpdate={updateProfile} />;
      case "voice":
        return <VoiceInput onSave={handleSaveExpense} onCancel={() => setActivePage("dashboard")} />;
      default:
        return <Dashboard expenses={expenses} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={logout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="lg:ml-64 p-4 md:p-8">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Expense-Tracker</p>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  {activePage === "dashboard" && "Expense-Tracker Dashboard"}
                  {activePage === "expenses" && "Expense History"}
                  {activePage === "analytics" && "Spending Analytics"}
                  {activePage === "insights" && "AI Insights"}
                  {activePage === "settings" && "Account Settings"}
                  {activePage === "voice" && "Add Expense"}
                </h2>
                <p className="text-sm text-slate-500">{format(new Date(), "EEEE, MMMM do")}</p>
              </div>
            </div>
          </div>
          
          {/* Global Action Button */}
          {activePage !== "voice" && (
            <button 
              onClick={() => setActivePage("voice")}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          )}
        </header>

        {/* Active Page Content */}
        {renderPage()}
      </main>
    </div>
  );
}
