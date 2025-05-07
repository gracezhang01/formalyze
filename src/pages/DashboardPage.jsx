import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Plus, BarChart3, List, MessageSquareText, PencilLine, Settings, LogOut, User } from 'lucide-react';
import supabase from '../lib/supabase';
import ChatInterface from '../components/dashboard/ChatInterface';
import SurveyList from '../components/dashboard/SurveyList';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        setUser(data.user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background-light">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <span className="text-3xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-morandi-blue to-morandi-pink animate-pulse">
              Formalyze
            </span>
          </div>
          <p className="text-morandi-dark/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background-light flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-white border-r border-morandi-gray/20 w-64 p-6">
        <div className="mb-10">
          <Link to="/" className="inline-block relative">
            <span className="text-2xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-morandi-blue to-morandi-pink">
              Formalyze
            </span>
            <img 
              src="https://heyboss.heeyo.ai/1745725749-46880dad-t4.ftcdn.net-jpg-05-73-66-05-360-F-573660538-WR0rdKEgvR2RsIvFxpyYSAysevpBlueO.jpg"
              alt="Watercolor splash" 
              className="absolute -top-1 -right-4 w-6 h-6 opacity-70 transform -rotate-12"
            />
          </Link>
        </div>
        
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-morandi-blue/10 text-morandi-blue'
                    : 'text-morandi-dark hover:bg-background-subtle'
                }`}
              >
                <MessageSquareText size={18} className="mr-3" />
                AI Chat
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('surveys')}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'surveys'
                    ? 'bg-morandi-blue/10 text-morandi-blue'
                    : 'text-morandi-dark hover:bg-background-subtle'
                }`}
              >
                <List size={18} className="mr-3" />
                My Surveys
              </button>
            </li>
            {/* Analytics tab commented out
            <li>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-morandi-blue/10 text-morandi-blue'
                    : 'text-morandi-dark hover:bg-background-subtle'
                }`}
              >
                <BarChart3 size={18} className="mr-3" />
                Analytics
              </button>
            </li>
            */}
            <li>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-morandi-blue/10 text-morandi-blue'
                    : 'text-morandi-dark hover:bg-background-subtle'
                }`}
              >
                <Settings size={18} className="mr-3" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="pt-6 mt-6 border-t border-morandi-gray/20">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-morandi-blue/20 flex items-center justify-center text-morandi-blue">
              <User size={16} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-morandi-dark truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-morandi-dark/70 hover:text-morandi-dark transition-colors"
          >
            <LogOut size={16} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-morandi-gray/20 p-4 flex items-center justify-between md:hidden z-10">
        <Link to="/" className="inline-block relative">
          <span className="text-xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-morandi-blue to-morandi-pink">
            Formalyze
          </span>
          <img 
            src="https://heyboss.heeyo.ai/1745725749-46880dad-t4.ftcdn.net-jpg-05-73-66-05-360-F-573660538-WR0rdKEgvR2RsIvFxpyYSAysevpBlueO.jpg"
            alt="Watercolor splash" 
            className="absolute -top-1 -right-3 w-5 h-5 opacity-70 transform -rotate-12"
          />
        </Link>
        
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="flex items-center text-morandi-dark/70 hover:text-morandi-dark transition-colors ml-4"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-morandi-gray/20 md:hidden z-10">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center p-3 flex-1 ${
              activeTab === 'chat' ? 'text-morandi-blue' : 'text-morandi-dark/60'
            }`}
          >
            <MessageSquareText size={20} />
            <span className="text-xs mt-1">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('surveys')}
            className={`flex flex-col items-center p-3 flex-1 ${
              activeTab === 'surveys' ? 'text-morandi-blue' : 'text-morandi-dark/60'
            }`}
          >
            <List size={20} />
            <span className="text-xs mt-1">Surveys</span>
          </button>
          {/* Analytics tab commented out
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center p-3 flex-1 ${
              activeTab === 'analytics' ? 'text-morandi-blue' : 'text-morandi-dark/60'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-xs mt-1">Analytics</span>
          </button>
          */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center p-3 flex-1 ${
              activeTab === 'settings' ? 'text-morandi-blue' : 'text-morandi-dark/60'
            }`}
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow p-4 pt-16 md:pt-6 md:p-8 pb-20 md:pb-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'chat' && (
            <div className="motion-safe:animate-fade-in">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-morandi-dark">AI Chat</h1>
                  <p className="text-morandi-dark/70">Chat with AI to generate your survey questions</p>
                </div>
              </div>
              <ChatInterface user={user} />
            </div>
          )}
          
          {activeTab === 'surveys' && (
            <div className="motion-safe:animate-fade-in">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-morandi-dark">My Surveys</h1>
                  <p className="text-morandi-dark/70">Manage your created surveys</p>
                </div>
                <button className="btn-primary flex items-center" onClick={() => setActiveTab('chat')}>
                  <Plus size={16} className="mr-2" />
                  Create Survey
                </button>
              </div>
              <SurveyList user={user} onSetActiveTab={setActiveTab} />
            </div>
          )}
          
          {/* Analytics tab content commented out
          {activeTab === 'analytics' && (
            <div className="motion-safe:animate-fade-in">
              <h1 className="text-2xl font-bold text-morandi-dark mb-6">Analytics</h1>
              <div className="card p-8 flex flex-col items-center justify-center text-center">
                <BarChart3 size={48} className="text-morandi-blue/40 mb-4" />
                <h3 className="text-lg font-medium text-morandi-dark mb-2">No Analytics Available</h3>
                <p className="text-morandi-dark/70 mb-6 max-w-md">
                  Create and publish surveys to start collecting responses and view analytics here.
                </p>
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('chat')}
                >
                  Create Your First Survey
                </button>
              </div>
            </div>
          )}
          */}
          
          {activeTab === 'settings' && (
            <div className="motion-safe:animate-fade-in">
              <h1 className="text-2xl font-bold text-morandi-dark mb-6">Settings</h1>
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Account Information</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-morandi-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-field bg-background-subtle/50 text-morandi-dark/70 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-morandi-dark/60">
                    This is the email address associated with your account
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
  