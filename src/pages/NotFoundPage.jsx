
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background-light">
      <div className="text-center max-w-md motion-safe:animate-fade-in">
        <div className="relative mb-8">
          <div className="text-9xl font-bold font-poppins text-morandi-gray/20">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl font-medium text-morandi-dark">Page Not Found</p>
          </div>
        </div>
        
        <p className="text-morandi-dark/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/" className="inline-flex items-center btn-primary">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
