import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, CheckCircle2, BarChart, ChevronLeft, ChevronRight } from 'lucide-react';

const ProcessStep = ({ number, icon, title, description, isActive }) => {
  return (
    <div className={`relative ${isActive ? 'scale-105' : ''} transition-all duration-300`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg z-10 relative
                     ${isActive ? 'bg-gradient-to-r from-morandi-blue to-morandi-pink shadow-lg' : 'bg-morandi-gray'}`}>
        {number}
      </div>
      <div className={`card ${isActive ? 'shadow-morandi-hover border-l-4 border-morandi-blue' : ''} mt-4 transition-all duration-300`}>
        <div className="flex items-start">
          <div className={`p-2 rounded-full ${isActive ? 'text-morandi-blue' : 'text-morandi-dark/60'}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h4 className={`font-medium ${isActive ? 'text-morandi-blue' : 'text-morandi-dark'}`}>{title}</h4>
            <p className="text-sm text-morandi-dark/70 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonial = ({ quote, name, role, company }) => {
  return (
    <div className="card bg-background-subtle mx-4 h-full">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-morandi-blue/40">
            <path d="M11.3 5.7C11.7 5.3 12.5 5.3 12.9 5.7L18.3 11.1C18.7 11.5 18.7 12.3 18.3 12.7L12.9 18.1C12.5 18.5 11.7 18.5 11.3 18.1C10.9 17.7 10.9 16.9 11.3 16.5L15.9 12L11.3 7.5C10.9 7.1 10.9 6.2 11.3 5.7Z" fill="currentColor" />
            <path d="M5.3 5.7C5.7 5.3 6.5 5.3 6.9 5.7L12.3 11.1C12.7 11.5 12.7 12.3 12.3 12.7L6.9 18.1C6.5 18.5 5.7 18.5 5.3 18.1C4.9 17.7 4.9 16.9 5.3 16.5L9.9 12L5.3 7.5C4.9 7.1 4.9 6.2 5.3 5.7Z" fill="currentColor" />
          </svg>
        </div>
        <p className="text-morandi-dark/80 font-light italic flex-grow">{quote}</p>
        <div className="mt-6 pt-6 border-t border-morandi-gray/20">
          <p className="font-medium text-morandi-dark">{name}</p>
          <p className="text-sm text-morandi-dark/70">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const sliderRef = useRef(null);
  
  const testimonials = [
    {
      quote: "Formalyze has completely transformed how we collect customer feedback. The AI suggestions saved us hours of work and the analytics provide insights we never had before.",
      name: "Sarah Johnson",
      role: "UX Researcher",
      company: "DesignCraft"
    },
    {
      quote: "The beautiful design of our surveys has increased our response rates by over 40%. Our participants actually enjoy filling them out now!",
      name: "Michael Chen",
      role: "Product Manager",
      company: "TechInnovate"
    },
    {
      quote: "As an event organizer, I need to collect attendee information efficiently. Formalyze makes the process so simple and the results look professional.",
      name: "Alicia Rodriguez",
      role: "Event Director",
      company: "GlobalEvents"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 3 ? prev + 1 : 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = (currentTestimonial + 1) % testimonials.length * sliderRef.current.offsetWidth;
    }
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = ((currentTestimonial - 1 + testimonials.length) % testimonials.length) * sliderRef.current.offsetWidth;
    }
  };

  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-background-subtle">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins">How Formalyze Works</h2>
          <p className="mt-4 text-lg text-morandi-dark/70 max-w-2xl mx-auto">
            Create, publish, and analyze surveys in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          <ProcessStep 
            number="1" 
            icon={<MessageCircle size={20} />} 
            title="Chat with AI" 
            description="Describe your survey goals and our AI will suggest questions and formatting options."
            isActive={activeStep === 1}
          />
          <ProcessStep 
            number="2" 
            icon={<CheckCircle2 size={20} />} 
            title="Customize & Publish" 
            description="Review AI suggestions, customize your survey design, and publish to collect responses."
            isActive={activeStep === 2}
          />
          <ProcessStep 
            number="3" 
            icon={<BarChart size={20} />} 
            title="Analyze Results" 
            description="View comprehensive analytics and gain insights from your survey responses."
            isActive={activeStep === 3}
          />
        </div>

        <div className="text-center">
          <Link to="/signup" className="btn-primary inline-flex">
            Try Formalyze Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
