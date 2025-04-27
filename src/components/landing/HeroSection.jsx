
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 motion-safe:animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins leading-tight bg-clip-text text-transparent bg-gradient-to-r from-morandi-dark to-morandi-blue/90">
              Transform Your Data Collection
            </h1>
            <p className="mt-6 text-xl text-morandi-dark/80 max-w-lg">
              Create beautiful, AI-powered surveys that engage respondents and deliver meaningful insights with Formalyze.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup" className="btn-primary flex items-center justify-center">
                <span>Get Started</span>
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <a href="#how-it-works" className="btn-secondary flex items-center justify-center">
                Learn More
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 relative motion-safe:animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-morandi-pink/40 via-morandi-blue/30 to-morandi-green/30 rounded-morandi animate-gradient-shift bg-size-200 transform rotate-3"></div>
              <div className="relative rounded-morandi overflow-hidden shadow-morandi-hover transform -rotate-3 transition-all hover:rotate-0 duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?ixid=M3w2MjE1MDB8MHwxfHNlYXJjaHwyfHxNb3JhbmRpJTIwY29sb3IlMjBwYWxldHRlJTJDJTIwc29mdCUyMG11dGVkJTIwcGFzdGVsc3xlbnwwfHx8fDE3NDU3MjU3NDh8MA&ixlib=rb-4.0.3"
                  alt="Abstract colorful gradient"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 flex flex-col justify-end p-6">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
                    <h3 className="font-medium text-morandi-dark">AI Survey Generation</h3>
                    <p className="text-sm text-morandi-dark/70 mt-1">Create professional surveys in minutes with our AI-powered suggestions</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-morandi-green/20 rounded-full blur-xl"></div>
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-morandi-pink/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
