import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-morandi-dark mb-4">404</h1>
        <h2 className="text-2xl font-medium text-morandi-dark mb-4">Page Not Found</h2>
        <p className="text-morandi-dark/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
