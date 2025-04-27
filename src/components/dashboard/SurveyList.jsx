
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Download, Share2, BarChart2 } from 'lucide-react';

const mockSurveys = [
  {
    id: '001',
    title: 'Customer Satisfaction Survey',
    createdAt: '2025-03-15',
    responses: 24,
    status: 'active',
    questions: 8,
  },
  {
    id: '002',
    title: 'Website User Experience Feedback',
    createdAt: '2025-03-10',
    responses: 17,
    status: 'active',
    questions: 12,
  },
  {
    id: '003',
    title: 'Employee Engagement Survey',
    createdAt: '2025-03-05',
    responses: 0,
    status: 'draft',
    questions: 15,
  },
];

const SurveyCard = ({ survey, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-500/20 text-green-700';
      case 'draft':
        return 'bg-morandi-gray/30 text-morandi-dark/70';
      case 'closed':
        return 'bg-morandi-blue/20 text-morandi-blue';
      default:
        return 'bg-morandi-gray/20 text-morandi-dark/70';
    }
  };

  return (
    <div className="card card-hover relative">
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs ${getStatusColor(survey.status)}`}>
        {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
      </div>
      
      <h3 className="font-medium text-lg mb-2">{survey.title}</h3>
      
      <div className="flex items-center space-x-4 text-sm text-morandi-dark/70 mb-4">
        <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
        <span>•</span>
        <span>{survey.questions} questions</span>
        <span>•</span>
        <span>{survey.responses} responses</span>
      </div>
      
      {/* Survey actions */}
      <div className="flex items-center">
        <div className="flex-grow">
          <Link to={`/survey/${survey.id}`} className="btn-text flex items-center">
            <Eye size={16} className="mr-1" />
            View Survey
          </Link>
        </div>
        
        <div className="relative">
          <button
            className="p-2 hover:bg-background-subtle rounded-full transition-colors"
            onClick={() => setShowActions(!showActions)}
            aria-label="More actions"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="6" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="18" r="2" fill="currentColor" />
            </svg>
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-morandi-gray/20 py-1 z-10">
              <button className="flex items-center w-full px-4 py-2 text-sm text-morandi-dark hover:bg-background-subtle transition-colors text-left">
                <Edit size={16} className="mr-3 text-morandi-blue" />
                Edit Survey
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-morandi-dark hover:bg-background-subtle transition-colors text-left">
                <BarChart2 size={16} className="mr-3 text-morandi-green" />
                View Results
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-morandi-dark hover:bg-background-subtle transition-colors text-left">
                <Share2 size={16} className="mr-3 text-morandi-blue" />
                Share Survey
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-morandi-dark hover:bg-background-subtle transition-colors text-left">
                <Download size={16} className="mr-3 text-morandi-dark/70" />
                Export Responses
              </button>
              <div className="border-t border-morandi-gray/20 my-1"></div>
              <button 
                onClick={() => {
                  onDelete(survey.id);
                  setShowActions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 size={16} className="mr-3" />
                Delete Survey
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptySurveyList = () => {
  return (
    <div className="card flex flex-col items-center text-center p-8">
      <div className="w-16 h-16 mb-6 rounded-full bg-morandi-blue/10 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-morandi-blue">
          <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.6937 13.7h.009M15.6937 16.7h.009M11.9955 13.7h.009M11.9955 16.7h.009M8.29431 13.7h.009M8.29431 16.7h.009" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-xl font-medium text-morandi-dark mb-2">No Surveys Yet</h3>
      <p className="text-morandi-dark/70 mb-6">
        Start by creating your first survey with AI assistance
      </p>
      <Link to="/dashboard" onClick={() => window.location.hash = "/dashboard"} className="btn-primary">
        Create Your First Survey
      </Link>
    </div>
  );
};

const SurveyList = ({ user }) => {
  const [surveys, setSurveys] = useState(mockSurveys);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const handleDeleteSurvey = (id) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      setSurveys(surveys.filter(survey => survey.id !== id));
    }
  };
  
  const filteredSurveys = surveys
    .filter(survey => survey.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(survey => filter === 'all' || survey.status === filter);

  if (surveys.length === 0) {
    return <EmptySurveyList />;
  }

  return (
    <div>
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-morandi-dark/50">
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-morandi-dark/70 mr-2">Filter:</span>
          <div className="flex border border-morandi-gray/30 rounded-lg overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'all' 
                  ? 'bg-morandi-blue text-white' 
                  : 'bg-white text-morandi-dark hover:bg-background-subtle'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'active' 
                  ? 'bg-morandi-blue text-white' 
                  : 'bg-white text-morandi-dark hover:bg-background-subtle'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'draft' 
                  ? 'bg-morandi-blue text-white' 
                  : 'bg-white text-morandi-dark hover:bg-background-subtle'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>
      
      {/* Survey list */}
      {filteredSurveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map(survey => (
            <SurveyCard 
              key={survey.id}
              survey={survey}
              onDelete={handleDeleteSurvey}
            />
          ))}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="text-morandi-dark/70">No surveys found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SurveyList;
  