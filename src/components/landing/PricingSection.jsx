
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';

const PricingToggle = ({ isAnnual, setIsAnnual }) => {
  return (
    <div className="flex items-center justify-center mb-10">
      <span className={`text-sm font-medium ${!isAnnual ? 'text-morandi-dark' : 'text-morandi-dark/60'}`}>
        Monthly
      </span>
      <button 
        onClick={() => setIsAnnual(!isAnnual)} 
        className="mx-4 relative"
      >
        <div className={`w-12 h-6 rounded-full transition-colors ${isAnnual ? 'bg-morandi-blue' : 'bg-morandi-gray'}`}></div>
        <div 
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
            isAnnual ? 'translate-x-6' : ''
          }`}
        ></div>
      </button>
      <div className="flex items-center">
        <span className={`text-sm font-medium ${isAnnual ? 'text-morandi-dark' : 'text-morandi-dark/60'}`}>
          Annual
        </span>
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-morandi-green/20 text-morandi-green">
          Save 20%
        </span>
      </div>
    </div>
  );
};

const PricingCard = ({ name, price, annualPrice, description, features, isPopular }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`card relative overflow-hidden transition-all duration-300 border
                 ${isPopular 
                   ? 'border-morandi-blue shadow-morandi-hover' 
                   : 'border-morandi-gray/30 hover:shadow-morandi'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-morandi-blue text-white px-6 py-1 text-xs font-medium rotate-45">
          Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-medium mb-2">{name}</h3>
        <p className="text-morandi-dark/70 text-sm mb-6">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-3xl font-bold">${price.monthly}</span>
            <span className="text-morandi-dark/60 text-sm ml-2 mb-1">/month</span>
          </div>
          <div className="text-xs text-morandi-dark/60">
            or ${price.annual}/month billed annually
          </div>
        </div>
        
        <Link
          to="/signup"
          className={`block text-center py-2.5 rounded-morandi font-medium transition-all duration-300
                     ${isPopular
                       ? 'bg-gradient-to-r from-morandi-blue to-morandi-pink text-white hover:shadow-lg'
                       : 'bg-background-subtle text-morandi-dark border border-morandi-gray/30 hover:bg-morandi-gray/10'
                     }`}
        >
          Get Started
        </Link>
        
        <div className="mt-8">
          <p className="font-medium text-sm mb-3">What's included:</p>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check size={18} className={`mr-2 flex-shrink-0 ${isPopular ? 'text-morandi-blue' : 'text-morandi-green'}`} />
                <span className="text-sm text-morandi-dark/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {isPopular && isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-morandi-blue to-morandi-pink"></div>
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-morandi-pink to-morandi-blue"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-morandi-blue to-morandi-pink"></div>
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-morandi-pink to-morandi-blue"></div>
        </div>
      )}
    </div>
  );
};

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      name: "Free",
      price: {
        monthly: 0,
        annual: 0,
      },
      description: "Perfect for getting started",
      features: [
        "5 surveys per month",
        "Up to 100 responses per survey",
        "Basic analytics",
        "AI question suggestions (limited)",
        "Email support"
      ],
      isPopular: false
    },
    {
      name: "Professional",
      price: {
        monthly: 19,
        annual: 15,
      },
      description: "Ideal for individuals and small teams",
      features: [
        "Unlimited surveys",
        "Up to 1,000 responses per survey",
        "Advanced analytics",
        "Full AI assistant features",
        "Priority support",
        "Custom branding"
      ],
      isPopular: true
    },
    {
      name: "Business",
      price: {
        monthly: 49,
        annual: 39,
      },
      description: "For growing teams with advanced needs",
      features: [
        "Unlimited surveys",
        "Unlimited responses",
        "Enterprise analytics",
        "Team collaboration",
        "Advanced integrations",
        "Dedicated success manager",
        "SLA guarantees"
      ],
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-morandi-dark/70 max-w-2xl mx-auto">
            Choose the plan that best fits your needs
          </p>
          
          <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              name={plan.name}
              price={{
                monthly: isAnnual ? plan.price.annual : plan.price.monthly,
                annual: plan.price.annual
              }}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
            />
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center bg-background-subtle p-8 rounded-morandi">
          <div className="flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-morandi-blue mr-2" />
            <h3 className="text-xl font-medium">Need a custom solution?</h3>
          </div>
          <p className="text-morandi-dark/80 mb-6">
            We offer tailored enterprise solutions with custom integrations, dedicated support, and more. Contact us to discuss your specific requirements.
          </p>
          <a href="#" className="btn-secondary inline-flex">
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
