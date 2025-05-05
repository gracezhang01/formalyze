import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import auth from '../lib/auth';

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const isLogin = mode === 'login';
  const title = isLogin ? 'Welcome Back' : 'Create Your Account';
  const buttonText = isLogin ? 'Sign In' : 'Sign Up';
  const alternateText = isLogin 
    ? "Don't have an account?" 
    : "Already have an account?";
  const alternateLink = isLogin ? '/signup' : '/login';
  const alternateLinkText = isLogin ? 'Sign Up' : 'Sign In';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      console.log(`Attempting ${isLogin ? 'sign in' : 'sign up'}...`);
      const { data, error } = isLogin
        ? await auth.signIn(email, password)
        : await auth.signUp(email, password);
      
      if (error) {
        console.error('Auth error:', error);
        // Provide more specific error messages
        if (error.message.includes('User already exists')) {
          setErrorMessage('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Please check your email to confirm your account.');
        } else {
          setErrorMessage(error.message || 'An error occurred during authentication.');
        }
        return;
      }
      
      console.log('Auth successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (error) {
      console.error('Unexpected error during auth:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-light">
      <Link to="/" className="absolute top-6 left-6 flex items-center text-morandi-dark/70 hover:text-morandi-blue transition-colors">
        <ArrowLeft size={18} className="mr-2" />
        <span>Back to Home</span>
      </Link>
      
      <div className="w-full max-w-md motion-safe:animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block relative mb-2">
            <span className="text-2xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-morandi-blue to-morandi-pink">
              Formalyze
            </span>
            <img 
              src="https://heyboss.heeyo.ai/1745725749-46880dad-t4.ftcdn.net-jpg-05-73-66-05-360-F-573660538-WR0rdKEgvR2RsIvFxpyYSAysevpBlueO.jpg"
              alt="Watercolor splash" 
              className="absolute -top-1 -right-4 w-6 h-6 opacity-70 transform -rotate-12"
            />
          </Link>
          <h1 className="text-2xl font-bold font-poppins text-morandi-dark">{title}</h1>
          <p className="mt-2 text-morandi-dark/70">
            {isLogin ? 'Sign in to continue to your account' : 'Start creating beautiful surveys today'}
          </p>
        </div>
        
        <div className="card shadow-morandi">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-morandi text-sm flex items-start">
              <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-morandi text-sm flex items-start">
              <Check size={16} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-morandi-dark mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-morandi-dark/50" 
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-morandi-dark mb-1">
                Password
              </label>
              <div className="relative">
                <Lock 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-morandi-dark/50" 
                />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className={`btn-primary w-full flex justify-center items-center ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Processing</span>
                  <span className="ml-2">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </span>
                </>
              ) : (
                buttonText
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-morandi-dark/70">{alternateText}</span>{' '}
            <Link to={alternateLink} className="text-morandi-blue font-medium hover:text-morandi-pink transition-colors">
              {alternateLinkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
  