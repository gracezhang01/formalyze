
import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Edit, Share2, Eye, Clipboard, Check } from 'lucide-react';
import supabase from '../lib/supabase';

const mockSurveyData = {
  '001': {
    id: '001',
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our products and services by sharing your experience.',
    createdAt: '2025-03-15',
    status: 'active',
    questions: [
      {
        id: 'q1',
        text: 'How satisfied are you with our product/service?',
        type: 'rating',
        required: true,
        options: [1, 2, 3, 4, 5]
      },
      {
        id: 'q2',
        text: 'What aspects of our product/service do you like the most?',
        type: 'open',
        required: false
      },
      {
        id: 'q3',
        text: 'What improvements would you suggest for our product/service?',
        type: 'open',
        required: false
      },
      {
        id: 'q4',
        text: 'How likely are you to recommend us to a friend or colleague?',
        type: 'nps',
        required: true,
        options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      },
      {
        id: 'q5',
        text: 'Did our product/service meet your expectations?',
        type: 'multiple',
        required: true,
        options: ['Exceeded expectations', 'Met expectations', 'Below expectations']
      }
    ],
    responses: [
      {
        id: 'r1',
        createdAt: '2025-03-16',
        answers: {
          q1: 4,
          q2: 'Easy to use interface and helpful customer support.',
          q3: 'More customization options would be great.',
          q4: 9,
          q5: 'Met expectations'
        }
      },
      {
        id: 'r2',
        createdAt: '2025-03-17',
        answers: {
          q1: 5,
          q2: 'The product is intuitive and saves me a lot of time.',
          q3: 'Nothing to improve, works perfectly!',
          q4: 10,
          q5: 'Exceeded expectations'
        }
      }
    ]
  },
  '002': {
    id: '002',
    title: 'Website User Experience Feedback',
    description: 'Help us make our website better for you.',
    createdAt: '2025-03-10',
    status: 'active',
    questions: [
      {
        id: 'q1',
        text: 'How easy was it to find what you were looking for on our website?',
        type: 'rating',
        required: true,
        options: [1, 2, 3, 4, 5]
      },
      {
        id: 'q2',
        text: 'Which features of our website do you use most frequently?',
        type: 'multiple',
        required: true,
        options: ['Product search', 'Blog articles', 'Customer reviews', 'FAQ section', 'Contact form']
      },
      {
        id: 'q3',
        text: 'What additional features would you like to see on our website?',
        type: 'open',
        required: false
      }
    ],
    responses: []
  },
  '003': {
    id: '003',
    title: 'Employee Engagement Survey',
    description: 'Confidential survey to gather feedback on workplace satisfaction.',
    createdAt: '2025-03-05',
    status: 'draft',
    questions: [
      {
        id: 'q1',
        text: 'How satisfied are you with your current role?',
        type: 'rating',
        required: true,
        options: [1, 2, 3, 4, 5]
      },
      {
        id: 'q2',
        text: 'Do you feel your work is valued by the organization?',
        type: 'boolean',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'q3',
        text: 'What aspects of your workplace would you like to see improved?',
        type: 'open',
        required: false
      },
      {
        id: 'q4',
        text: 'How would you rate the work-life balance in your role?',
        type: 'rating',
        required: true,
        options: [1, 2, 3, 4, 5]
      },
      {
        id: 'q5',
        text: 'Do you feel you have opportunities for career growth?',
        type: 'multiple',
        required: true,
        options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree']
      }
    ],
    responses: []
  }
};

const SurveyQuestion = ({ question, index }) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'rating':
        return (
          <div className="flex items-center gap-2 mt-2">
            {question.options.map(option => (
              <button
                key={option}
                className="w-10 h-10 rounded-lg border border-morandi-gray/40 bg-background-subtle flex items-center justify-center hover:bg-morandi-blue/10 hover:border-morandi-blue transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'nps':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {question.options.map(option => (
              <button
                key={option}
                className="w-10 h-10 rounded-lg border border-morandi-gray/40 bg-background-subtle flex items-center justify-center hover:bg-morandi-blue/10 hover:border-morandi-blue transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'multiple':
        return (
          <div className="space-y-2 mt-2">
            {question.options.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`${question.id}-${option}`}
                  name={question.id}
                  className="w-4 h-4 text-morandi-blue"
                />
                <label htmlFor={`${question.id}-${option}`} className="ml-2 text-morandi-dark">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case 'boolean':
        return (
          <div className="flex gap-4 mt-2">
            {question.options.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`${question.id}-${option}`}
                  name={question.id}
                  className="w-4 h-4 text-morandi-blue"
                />
                <label htmlFor={`${question.id}-${option}`} className="ml-2 text-morandi-dark">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case 'open':
      default:
        return (
          <textarea
            className="input-field mt-2 resize-none h-24"
            placeholder="Type your answer here..."
          ></textarea>
        );
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 w-8 h-8 rounded-full bg-morandi-blue/10 flex items-center justify-center text-morandi-blue font-medium">
          {index + 1}
        </div>
        <div className="flex-grow">
          <label className="block font-medium text-morandi-dark">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderQuestionInput()}
        </div>
      </div>
    </div>
  );
};

const ResultsTab = ({ survey }) => {
  if (!survey.responses || survey.responses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-subtle flex items-center justify-center">
          <BarChart2 size={24} className="text-morandi-dark/60" />
        </div>
        <h3 className="text-lg font-medium text-morandi-dark mb-2">No Responses Yet</h3>
        <p className="text-morandi-dark/70 mb-6 max-w-md mx-auto">
          Share your survey to start collecting responses. Results will appear here once people respond.
        </p>
        <button className="btn-primary">
          Share Survey
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-morandi shadow-morandi overflow-hidden">
        {/* Video preview for analytics */}
        <div className="relative h-36 overflow-hidden rounded-t-morandi">
          <video 
            className="absolute inset-0 w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="https://cdn.pixabay.com/video/2020/01/30/31772-388253161_medium.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-white text-xl font-medium">Survey Analytics</h2>
            <p className="text-white/80 text-sm">{survey.responses.length} responses collected</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h3 className="font-medium mb-4">Response Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card bg-background-subtle">
                <div className="text-3xl font-bold text-morandi-blue mb-1">{survey.responses.length}</div>
                <div className="text-sm text-morandi-dark/70">Total Responses</div>
              </div>
              <div className="card bg-background-subtle">
                <div className="text-3xl font-bold text-morandi-green mb-1">100%</div>
                <div className="text-sm text-morandi-dark/70">Completion Rate</div>
              </div>
              <div className="card bg-background-subtle">
                <div className="text-3xl font-bold text-morandi-pink mb-1">2m 45s</div>
                <div className="text-sm text-morandi-dark/70">Average Time</div>
              </div>
            </div>
          </div>
          
          {survey.questions.map((question, index) => (
            <div key={question.id} className="mb-8 pb-6 border-b border-morandi-gray/20">
              <h3 className="font-medium mb-2">Question {index + 1}: {question.text}</h3>
              
              {question.type === 'rating' && (
                <div className="mt-4">
                  <div className="h-8 bg-background-subtle rounded-lg overflow-hidden">
                    <div className="h-full bg-morandi-blue rounded-lg" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-morandi-dark/70">Average: 4.2/5</span>
                    <span className="text-xs text-morandi-dark/70">{survey.responses.length} responses</span>
                  </div>
                </div>
              )}
              
              {question.type === 'multiple' && (
                <div className="space-y-3 mt-4">
                  {question.options.map((option, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-morandi-dark">{option}</span>
                        <span className="text-sm text-morandi-dark/70">{Math.floor(Math.random() * 100)}%</span>
                      </div>
                      <div className="h-6 bg-background-subtle rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-morandi-blue rounded-lg" 
                          style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {question.type === 'open' && (
                <div className="mt-4">
                  <div className="bg-background-subtle p-4 rounded-lg">
                    <p className="text-sm italic text-morandi-dark/80">"The product is intuitive and saves me a lot of time."</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <button className="text-sm text-morandi-blue hover:underline">View all {survey.responses.length} responses</button>
                    <button className="text-sm text-morandi-blue hover:underline flex items-center">
                      <Download size={14} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SurveyPreviewTab = ({ survey }) => {
  const [copied, setCopied] = useState(false);
  const surveyUrl = `https://formalyze.co/s/${survey.id}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div>
      {/* Share section */}
      <div className="card mb-6">
        <h3 className="font-medium mb-4">Share Your Survey</h3>
        <div className="flex items-center">
          <input
            type="text"
            value={surveyUrl}
            readOnly
            className="input-field flex-grow"
          />
          <button 
            className="btn-primary ml-2 flex items-center"
            onClick={copyLink}
          >
            {copied ? (
              <>
                <Check size={16} className="mr-1" />
                Copied
              </>
            ) : (
              <>
                <Clipboard size={16} className="mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Survey preview */}
      <div className="card">
        <div className="pb-4 mb-6 border-b border-morandi-gray/20">
          <h2 className="text-xl font-bold text-morandi-dark">{survey.title}</h2>
          <p className="mt-2 text-morandi-dark/70">{survey.description}</p>
        </div>
        
        <form>
          {survey.questions.map((question, index) => (
            <SurveyQuestion key={question.id} question={question} index={index} />
          ))}
          
          <div className="mt-8">
            <button type="button" className="btn-primary">
              Submit Responses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SurveyDetailPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        setUser(data.user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
    
    // Get survey data
    if (mockSurveyData[id]) {
      setSurvey(mockSurveyData[id]);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background-light">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <span className="text-3xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-morandi-blue to-morandi-pink animate-pulse">
              Formalyze
            </span>
          </div>
          <p className="text-morandi-dark/70">Loading survey details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!survey) {
    return (
      <div className="min-h-screen pt-16 px-4 bg-background-light">
        <div className="max-w-4xl mx-auto mt-8">
          <Link to="/dashboard" className="flex items-center text-morandi-dark/70 hover:text-morandi-blue transition-colors mb-6">
            <ArrowLeft size={18} className="mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="card p-12 text-center">
            <h2 className="text-xl font-medium text-morandi-dark mb-4">Survey Not Found</h2>
            <p className="text-morandi-dark/70 mb-6">
              The survey you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link to="/dashboard" className="btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen pt-16 px-4 bg-background-light">
      <div className="max-w-4xl mx-auto mt-8 pb-12">
        <Link to="/dashboard" className="flex items-center text-morandi-dark/70 hover:text-morandi-blue transition-colors mb-6">
          <ArrowLeft size={18} className="mr-2" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center mb-1">
              <h1 className="text-2xl font-bold text-morandi-dark">{survey.title}</h1>
              <div className={`ml-3 px-2 py-0.5 rounded-full text-xs ${getStatusColor(survey.status)}`}>
                {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
              </div>
            </div>
            <p className="text-morandi-dark/70">
              Created on {new Date(survey.createdAt).toLocaleDateString()} • {survey.questions.length} questions
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button className="btn-secondary flex items-center">
              <Edit size={16} className="mr-2" />
              Edit
            </button>
            <button className="btn-primary flex items-center">
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="border-b border-morandi-gray/30">
            <nav className="flex space-x-6">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`py-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'preview'
                    ? 'border-morandi-blue text-morandi-blue'
                    : 'border-transparent text-morandi-dark/70 hover:text-morandi-dark'
                }`}
              >
                <div className="flex items-center">
                  <Eye size={18} className="mr-2" />
                  Preview
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('results')}
                className={`py-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'results'
                    ? 'border-morandi-blue text-morandi-blue'
                    : 'border-transparent text-morandi-dark/70 hover:text-morandi-dark'
                }`}
              >
                <div className="flex items-center">
                  <BarChart2 size={18} className="mr-2" />
                  Results
                  {survey.responses.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-morandi-blue/10 text-morandi-blue">
                      {survey.responses.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'preview' ? (
          <SurveyPreviewTab survey={survey} />
        ) : (
          <ResultsTab survey={survey} />
        )}
      </div>
    </div>
  );
};

export default SurveyDetailPage;
  