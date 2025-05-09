
import { Link } from 'react-router-dom';
import { ArrowUp, Linkedin, Twitter, Youtube, LucideDatabaseBackup } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-background-subtle py-12 mt-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <div className="relative">
                <span className="text-xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-morandi-blue to-morandi-pink">
                  Formalyze
                </span>
                <img 
                  src="https://heyboss.heeyo.ai/1745725749-46880dad-t4.ftcdn.net-jpg-05-73-66-05-360-F-573660538-WR0rdKEgvR2RsIvFxpyYSAysevpBlueO.jpg"
                  alt="Watercolor splash" 
                  className="absolute -top-1 -right-4 w-5 h-5 opacity-70 transform -rotate-12"
                />
              </div>
            </Link>
            <p className="mt-4 text-sm text-morandi-dark/80">
              Transform your data collection with AI-powered surveys that look beautiful and yield meaningful insights.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://discord.com/invite/JEjdkQuHz4" className="text-morandi-dark/70 hover:text-morandi-blue transition-colors" aria-label="LucideDatabaseBackup">
                <LucideDatabaseBackup size={18} />
              </a>
              <a href="https://www.linkedin.com/company/heyboss-xyz/" className="text-morandi-dark/70 hover:text-morandi-blue transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="https://x.com/heybossAI" className="text-morandi-dark/70 hover:text-morandi-blue transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://www.youtube.com/@heyboss-xyz" className="text-morandi-dark/70 hover:text-morandi-blue transition-colors" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h4 className="font-medium text-lg mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="/#features" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">Features</a></li>
              <li><a href="/#how-it-works" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">How It Works</a></li>
              <li><a href="/#pricing" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h4 className="font-medium text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h4 className="font-medium text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">About Us</a></li>
              <li><a href="https://legal.heyboss.tech/67845cfe76f9675292514b80/" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">Terms & Conditions</a></li>
              <li><a href="https://legal.heyboss.tech/67845a5e6e6bf5ecd4a3ae47/" className="text-sm text-morandi-dark/70 hover:text-morandi-blue transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-morandi-gray/20 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-morandi-dark/60">© 2025 Formalyze. All rights reserved.</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 text-sm text-morandi-dark/70 hover:text-morandi-blue mt-4 sm:mt-0 transition-colors group"
          >
            <span>Back to top</span>
            <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
