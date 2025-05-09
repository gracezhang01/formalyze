import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const SurveyResponsePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      
      // 获取调查问卷基本信息
      const { data: surveyData, error: surveyError } = await supabase
        .from('680da8fd0ef55179cf75685a_surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (surveyError) throw surveyError;
      
      // 获取调查问卷问题
      const { data: questionsData, error: questionsError } = await supabase
        .from('680da8fd0ef55179cf75685a_questions')
        .select('*')
        .eq('survey_id', id)
        .order('position', { ascending: true });

      if (questionsError) throw questionsError;
      
      // 检查调查问卷是否处于活动状态
      if (surveyData.status !== 'active') {
        throw new Error('This survey is no longer accepting responses');
      }
      
      setSurvey(surveyData);
      setQuestions(questionsData);
      
      // 初始化答案对象
      const initialAnswers = {};
      questionsData.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setAnswers(initialAnswers);
      
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // 验证必填问题
      const requiredQuestions = questions.filter(q => q.required);
      for (const question of requiredQuestions) {
        if (!answers[question.id]) {
          throw new Error(`Please answer the question: ${question.text}`);
        }
      }
      
      // 准备响应数据
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer
      }));
      
      // 保存响应
      const { error: responseError } = await supabase
        .from('680da8fd0ef55179cf75685a_responses')
        .insert({
          survey_id: id,
          answers: formattedAnswers,
          created_at: new Date().toISOString()
        });
        
      if (responseError) throw responseError;
      
      // 显示成功消息
      setSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting response:', error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-morandi-blue mx-auto"></div>
            <p className="mt-4 text-morandi-dark/70">Loading survey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-morandi-dark/70 mb-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mx-auto mb-4">
              <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m7.75 12 2.83 2.83 5.67-5.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-xl font-bold text-morandi-dark mb-4">Thank You!</h2>
            <p className="text-morandi-dark/70 mb-6">Your response has been submitted successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 mb-8">
          <h1 className="text-2xl font-bold text-morandi-dark mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-morandi-dark/70">{survey.description}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="card p-6">
              <div className="flex items-start mb-4">
                <span className="bg-morandi-blue/10 text-morandi-blue rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-medium text-morandi-dark">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>
              </div>
              
              {/* 根据问题类型渲染不同的输入控件 */}
              {question.type === 'text' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="input-field w-full"
                  required={question.required}
                />
              )}
              
              {question.type === 'multiple' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleInputChange(question.id, option)}
                        className="mr-2"
                        required={question.required}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'rating' && question.options && (
                <div className="flex space-x-4 mt-2">
                  {question.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleInputChange(question.id, option)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        answers[question.id] === option
                          ? 'bg-morandi-blue text-white'
                          : 'bg-morandi-gray/20 text-morandi-dark hover:bg-morandi-gray/30'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              {question.type === 'boolean' && (
                <div className="flex space-x-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange(question.id, 'Yes')}
                    className={`px-4 py-2 rounded-lg ${
                      answers[question.id] === 'Yes'
                        ? 'bg-morandi-blue text-white'
                        : 'bg-morandi-gray/20 text-morandi-dark hover:bg-morandi-gray/30'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange(question.id, 'No')}
                    className={`px-4 py-2 rounded-lg ${
                      answers[question.id] === 'No'
                        ? 'bg-morandi-blue text-white'
                        : 'bg-morandi-gray/20 text-morandi-dark hover:bg-morandi-gray/30'
                    }`}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          ))}
          
          <div className="card p-6">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyResponsePage; 