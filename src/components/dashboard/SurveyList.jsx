import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Download, Share2, BarChart2 } from 'lucide-react';
import supabase from '../../lib/supabase';

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
  const navigate = useNavigate();
  
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

  console.log('Rendering SurveyCard for survey:', {
    id: survey.id,
    title: survey.title,
    questions: survey.questions,
    responses: survey.responses,
    questionsData: survey.questionsData,
    responsesData: survey.responsesData
  });

  return (
    <div className="card card-hover relative p-6">
      <div className="flex flex-col h-full">
        {/* Header with title and status */}
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-medium text-lg text-morandi-dark break-words flex-1">{survey.title}</h3>
          <div className={`shrink-0 px-2 py-1 rounded-full text-xs ${getStatusColor(survey.status)} whitespace-nowrap`}>
            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
          </div>
        </div>
        
        {/* Description */}
        {survey.description && (
          <p className="text-sm text-morandi-dark/70 mt-2 mb-4 break-words line-clamp-2">{survey.description}</p>
        )}
        
        {/* Survey info */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-morandi-dark/70 mb-4">
          <span className="break-words">{new Date(survey.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{survey.questions} questions</span>
          <span>•</span>
          <span>{survey.responses} responses</span>
        </div>

        {/* Actions */}
        <div className="flex items-center mt-auto">
          <div className="flex-grow">
            <Link to={`/survey/${survey.id}`} className="btn-text flex items-center">
              <Eye size={16} className="mr-1" />
              View Survey
            </Link>
          </div>
          
          <div className="relative">
            <button
              type="button"
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
                <button 
                  type="button"
                  className="flex items-center w-full px-4 py-2 text-sm text-morandi-dark hover:bg-background-subtle transition-colors text-left"
                >
                  <Share2 size={16} className="mr-3 text-morandi-blue" />
                  Share Survey
                </button>
                <div className="border-t border-morandi-gray/20 my-1"></div>
                <button 
                  type="button"
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
    </div>
  );
};

const EmptySurveyList = ({ onSetActiveTab }) => {
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
      <button onClick={() => onSetActiveTab('chat')} className="btn-primary">
        Create Your First Survey
      </button>
    </div>
  );
};

const SurveyList = ({ user, onSetActiveTab }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    console.log('=== SurveyList Component Mounted ===');
    console.log('User prop received:', user);
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      fetchSurveys();
    } else {
      console.warn('No user object available in SurveyList');
      setLoading(false);
    }
  }, [user]);

  const fetchSurveys = async () => {
    console.log('=== Starting fetchSurveys ===');
    try {
      setLoading(true);
      setError(null);
      
      // Debug Supabase client
      console.log('Supabase client available:', !!window.supabase);
      
      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session);
      console.log('Session error:', sessionError);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        console.warn('No active session found');
        throw new Error('No active session');
      }

      console.log('Fetching surveys for user:', user.id);
      
      // Fetch surveys with all necessary data
      const { data, error } = await supabase
        .from('surveys')
        .select(`
          id,
          title,
          description,
          created_by,
          created_at,
          updated_at,
          is_active,
          questions,
          responses
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      console.log('Raw survey data from Supabase:', data);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No surveys found in database');
        setSurveys([]);
        return;
      }

      // Transform data with detailed logging
      console.log('Transforming survey data...');
      const transformedSurveys = data.map(survey => {
        const questions = survey.questions || [];
        const responses = survey.responses || [];
        
        console.log('Processing survey:', {
          id: survey.id,
          title: survey.title,
          questions_count: questions.length,
          responses_count: responses.length,
          questions_data: questions,
          responses_data: responses
        });
        
        return {
          id: survey.id,
          title: survey.title,
          description: survey.description,
          createdAt: survey.created_at,
          updatedAt: survey.updated_at,
          responses: responses.length,
          status: survey.is_active ? 'active' : 'draft',
          questions: questions.length,
          questionsData: questions,
          responsesData: responses
        };
      });

      console.log('Final transformed surveys:', transformedSurveys);
      setSurveys(transformedSurveys);
      
    } catch (error) {
      console.error('Error in fetchSurveys:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('=== fetchSurveys completed ===');
    }
  };
  
  const handleDeleteSurvey = async (id) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        const { error } = await supabase
          .from('surveys')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update local state
        setSurveys(surveys.filter(survey => survey.id !== id));
      } catch (error) {
        console.error('Error deleting survey:', error);
        alert('Failed to delete survey. Please try again.');
      }
    }
  };
  
  const filteredSurveys = surveys
    .filter(survey => survey.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(survey => filter === 'all' || survey.status === filter);

  console.log('Filtered surveys:', filteredSurveys);

  if (loading) {
    return (
      <div className="card p-8 flex flex-col items-center text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-morandi-blue"></div>
        <p className="mt-4 text-morandi-dark/70">Loading surveys...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 flex flex-col items-center text-center">
        <div className="text-red-500 mb-4">Error loading surveys</div>
        <p className="text-morandi-dark/70 mb-4">{error}</p>
        <button 
          onClick={fetchSurveys}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!surveys || surveys.length === 0) {
    console.log('No surveys available, rendering EmptySurveyList');
    return <EmptySurveyList onSetActiveTab={onSetActiveTab} />;
  }

  return (
    <div>
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            id="survey-search"
            name="survey-search"
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
            aria-label="Search surveys"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-morandi-dark/50">
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-morandi-dark/70 mr-2">Filter:</span>
          <div className="flex border border-morandi-gray/30 rounded-lg overflow-hidden">
            <button
              type="button"
              id="filter-all"
              name="filter-all"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'all' 
                  ? 'bg-morandi-blue text-white' 
                  : 'bg-white text-morandi-dark hover:bg-background-subtle'
              }`}
              aria-label="Show all surveys"
            >
              All
            </button>
            <button
              type="button"
              id="filter-active"
              name="filter-active"
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'active' 
                  ? 'bg-morandi-blue text-white' 
                  : 'bg-white text-morandi-dark hover:bg-background-subtle'
              }`}
              aria-label="Show active surveys"
            >
              Active
            </button>
            <button
              type="button"
              id="filter-draft"
              name="filter-draft"
              onClick={() => setFilter('draft')}
              className={`px-3 py-1.5 text-sm ${
                filter === 'draft' 
                  ? 'bg-morandi-blue text-white' 
                  : 'bg-white text-morandi-dark hover:bg-background-subtle'
              }`}
              aria-label="Show draft surveys"
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
  