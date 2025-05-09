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
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Define mapQuestionType function at the component level
  const mapQuestionType = (type) => {
    console.log('Mapping question type:', type);
    switch (type) {
      case 'multiple_choice_single':
        return 'multiple';
      case 'multiple_choice':
        return 'multiple';
      case 'short_answer':
        return 'text';
      case 'yes_no':
        return 'boolean';
      case 'rating':
        return 'rating';
      default:
        return type;
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: id,
          answers: answers,
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError(error.message);
    }
  };

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      console.log('Raw data from DB:', data); // Debug log
      
      const mappedQuestions = data.questions.map(q => {
        console.log('Original question before mapping:', q); // Debug log
        
        return {
          id: q.id,
          text: q.question_text,
          type: q.question_type, // Keep the original question_type
          required: q.required,
          options: q.choices || [], // Use the choices array directly
          choices: q.choices || [], // Keep the original choices array too
          order_index: q.order_index,
          question_text: q.question_text,
          question_type: q.question_type
        };
      });

      console.log('Mapped questions:', mappedQuestions); // Debug log
      
      const surveyData = {
        ...data,
        questions: mappedQuestions
      };
      
      setSurvey(surveyData);
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [id]);

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
            <p className="text-morandi-dark/70 mb-6">Your responses have been submitted successfully.</p>
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
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-morandi-dark mb-2">{survey.title}</h1>
            <p className="text-morandi-dark/70">{survey.description}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {survey.questions.map((question, index) => (
              <div key={question.id || index} className="card p-6 mb-4">
                <div className="flex items-start mb-4">
                  <span className="text-morandi-dark/70 mr-2">{index + 1}.</span>
                  <div>
                    <h3 className="font-medium text-morandi-dark mb-2">{question.text}</h3>
                    {question.required && (
                      <span className="text-red-500 text-sm">* Required</span>
                    )}
                  </div>
                </div>

                {/* Rating Question */}
                {question.type === 'rating' && (
                  <div className="flex items-center gap-2 mt-2">
                    {question.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleAnswerChange(question.id, option.text)}
                        className={`w-10 h-10 rounded-lg border ${
                          answers[question.id] === option.text
                            ? 'border-morandi-blue bg-morandi-blue/10 text-morandi-blue'
                            : 'border-morandi-gray/40 bg-background-subtle hover:bg-morandi-blue/10 hover:border-morandi-blue'
                        } flex items-center justify-center transition-colors`}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Multiple Choice Questions (Single and Multiple) */}
                {(question.type === 'multiple_choice_single' || question.type === 'multiple_choice_multiple') && (
                  <div className="space-y-2 mt-2">
                    {(question.choices || []).map((choice) => (
                      <div key={choice.id} className="flex items-center">
                        <input
                          type={question.type === 'multiple_choice_single' ? 'radio' : 'checkbox'}
                          id={`${question.id}_${choice.id}`}
                          name={question.id}
                          value={choice.text}
                          onChange={(e) => {
                            if (question.type === 'multiple_choice_single') {
                              // For single choice, just use the selected value
                              handleAnswerChange(question.id, e.target.value);
                            } else {
                              // For multiple choice, maintain an array of selected values
                              const currentAnswers = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                              if (e.target.checked) {
                                handleAnswerChange(question.id, [...currentAnswers, e.target.value]);
                              } else {
                                handleAnswerChange(question.id, currentAnswers.filter(v => v !== e.target.value));
                              }
                            }
                          }}
                          checked={
                            question.type === 'multiple_choice_single'
                              ? answers[question.id] === choice.text
                              : Array.isArray(answers[question.id]) && answers[question.id].includes(choice.text)
                          }
                          className={`w-4 h-4 text-morandi-blue ${question.type === 'multiple_choice_multiple' ? 'rounded' : 'rounded-full'}`}
                          required={question.required && (
                            question.type === 'multiple_choice_single' || 
                            !answers[question.id] || 
                            answers[question.id].length === 0
                          )}
                        />
                        <label 
                          htmlFor={`${question.id}_${choice.id}`} 
                          className="ml-2 text-morandi-dark cursor-pointer"
                        >
                          {choice.text}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text/Short Answer Question */}
                {(question.type === 'text' || question.type === 'short_answer') && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full p-2 border border-morandi-gray/30 rounded-lg focus:outline-none focus:border-morandi-blue"
                    rows={3}
                    placeholder="Type your answer here..."
                    required={question.required}
                  />
                )}
              </div>
            ))}
            
            <div className="card p-6">
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Submit Survey
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicSurveyPage; 