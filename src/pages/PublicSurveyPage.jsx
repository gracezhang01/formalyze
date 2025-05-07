import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import supabase from '../lib/supabase';

const PublicSurveyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSurvey(data);
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('responses')
        .insert({
          survey_id: id,
          answers: Object.entries(responses).map(([question_id, answer]) => ({
            question_id,
            answer
          }))
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-morandi-gray/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-morandi-gray/20 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-morandi-gray/20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-morandi-dark/70 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold text-morandi-dark mb-4">Survey Not Found</h2>
            <p className="text-morandi-dark/70 mb-6">The survey you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-morandi-dark mb-4">Thank You!</h2>
            <p className="text-morandi-dark/70 mb-6">Your response has been submitted successfully.</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="btn-text flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </button>
        </div>

        {/* Survey Title and Description */}
        <div className="card p-8 mb-8">
          <h1 className="text-2xl font-bold text-morandi-dark mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-morandi-dark/70">{survey.description}</p>
          )}
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="card p-6">
              <div className="flex items-start mb-4">
                <span className="text-morandi-dark/70 mr-2">{index + 1}.</span>
                <div>
                  <h3 className="font-medium text-morandi-dark mb-2">{question.text}</h3>
                  {question.required && (
                    <span className="text-red-500 text-sm">* Required</span>
                  )}
                </div>
              </div>

              {question.type === 'rating' && (
                <div className="flex items-center gap-2 mt-2">
                  {question.options.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleResponseChange(question.id, option)}
                      className={`w-10 h-10 rounded-lg border ${
                        responses[question.id] === option
                          ? 'border-morandi-blue bg-morandi-blue/10 text-morandi-blue'
                          : 'border-morandi-gray/40 bg-background-subtle hover:bg-morandi-blue/10 hover:border-morandi-blue'
                      } transition-colors`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'multiple' && (
                <div className="space-y-2 mt-2">
                  {question.options.map(option => (
                    <div key={option} className="flex items-center">
                      <input
                        type="radio"
                        id={`${question.id}-${option}`}
                        name={question.id}
                        value={option}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        required={question.required}
                        className="w-4 h-4 text-morandi-blue"
                      />
                      <label htmlFor={`${question.id}-${option}`} className="ml-2 text-morandi-dark">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'open' && (
                <textarea
                  className="input-field mt-2 resize-none h-24"
                  placeholder="Type your answer here..."
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  required={question.required}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Submit Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicSurveyPage; 