
import { useState } from 'react';
import { Bot, Palette, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

const FeatureCard = ({ icon, title, description, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`card card-hover group ${isExpanded ? 'bg-background-subtle' : ''}`}>
      <div className="flex flex-col items-start">
        <div className="p-3 rounded-full bg-gradient-to-br from-morandi-blue/20 to-morandi-pink/20 mb-4 group-hover:from-morandi-blue/30 group-hover:to-morandi-pink/30 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-morandi-dark/70 mb-4">{description}</p>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center text-sm text-morandi-blue font-medium hover:text-morandi-pink transition-colors"
        >
          {isExpanded ? 'Show less' : 'Learn more'} 
          {isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
        </button>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-morandi-gray/20 text-sm text-morandi-dark/80 motion-safe:animate-fade-in">
            {details}
          </div>
        )}
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins">Features You'll Love</h2>
          <p className="mt-4 text-lg text-morandi-dark/70 max-w-2xl mx-auto">
            Discover how Formalyze makes survey creation and data collection beautiful, simple, and insightful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Bot size={24} className="text-morandi-blue" />}
            title="AI-Powered Creation"
            description="Let our AI generate professional survey questions based on your needs."
            details={
              <ul className="space-y-2 list-disc list-inside">
                <li>Smart question suggestions based on your survey topic</li>
                <li>Intelligent follow-up questions that adapt to your needs</li>
                <li>Question refinement with natural language editing</li>
                <li>Support for various question types and formats</li>
              </ul>
            }
          />

          <FeatureCard
            icon={<Palette size={24} className="text-morandi-pink" />}
            title="Beautiful Surveys"
            description="Create visually stunning surveys with our Morandi-inspired design system."
            details={
              <ul className="space-y-2 list-disc list-inside">
                <li>Elegant, artsy design with Morandi color palette</li>
                <li>Responsive layouts that work perfectly on any device</li>
                <li>Custom branding options to match your style</li>
                <li>Interactive elements that increase engagement</li>
              </ul>
            }
          />

          <FeatureCard
            icon={<BarChart3 size={24} className="text-morandi-green" />}
            title="Insightful Analytics"
            description="Gain valuable insights with comprehensive survey response analytics."
            details={
              <ul className="space-y-2 list-disc list-inside">
                <li>Real-time response tracking and visualization</li>
                <li>Advanced filtering and segmentation tools</li>
                <li>Export options for further analysis</li>
                <li>AI-powered response summarization</li>
              </ul>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
