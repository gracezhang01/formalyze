
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import supabase from '../../lib/supabase';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center motion-safe:hover:scale-105 transition-transform">
          <div className="relative">
            <span className="text-2xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-morandi-blue to-morandi-pink">
              Formalyze
            </span>
            <img 
              src="https://heyboss.heeyo.ai/1745725749-46880dad-t4.ftcdn.net-jpg-05-73-66-05-360-F-573660538-WR0rdKEgvR2RsIvFxpyYSAysevpBlueO.jpg"
              alt="Watercolor splash" 
              className="absolute -top-1 -right-4 w-6 h-6 opacity-70 transform -rotate-12"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="/#features" className="text-morandi-dark hover:text-morandi-blue transition-colors">Features</a>
          <a href="/#how-it-works" className="text-morandi-dark hover:text-morandi-blue transition-colors">How It Works</a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="btn-text">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="btn-secondary flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-text">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-morandi-dark focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md py-4 px-6 motion-safe:animate-fade-in">
          <nav className="flex flex-col space-y-3">
            <a 
              href="/#features" 
              className="text-morandi-dark py-2 hover:text-morandi-blue transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              href="/#how-it-works" 
              className="text-morandi-dark py-2 hover:text-morandi-blue transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="/#pricing" 
              className="text-morandi-dark py-2 hover:text-morandi-blue transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <hr className="border-morandi-gray/20 my-1" />
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-morandi-dark py-2 hover:text-morandi-blue transition-colors flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} className="mr-2" />
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-morandi-dark py-2 hover:text-morandi-blue transition-colors flex items-center w-full text-left"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-morandi-dark py-2 hover:text-morandi-blue transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
  