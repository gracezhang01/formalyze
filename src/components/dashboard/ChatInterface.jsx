import { useState, useRef, useEffect } from 'react';
import { Send, Download, Check, ChevronUp, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import axios from 'axios';

const QuestionSuggestion = ({ question, isSelected, onToggle }) => {
  return (
    <div 
      className={`p-3 rounded-lg border mb-2 cursor-pointer transition-all 
                  ${isSelected 
                    ? 'bg-morandi-blue/10 border-morandi-blue' 
                    : 'bg-white border-morandi-gray/30 hover:border-morandi-blue/50'}`}
      onClick={onToggle}
    >
      <div className="flex items-start">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 
                         ${isSelected ? 'bg-morandi-blue text-white' : 'border border-morandi-gray/50'}`}>
          {isSelected && <Check size={12} />}
        </div>
        <div>
          <p className="text-morandi-dark">{question.text}</p>
          {question.description && (
            <p className="text-sm text-morandi-dark/60 mt-1">{question.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const SurveyPreview = ({ selectedQuestions, onGenerateSurvey, isSurveyGenerating }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-background-subtle border border-morandi-gray/30 rounded-lg overflow-hidden mt-6">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Sparkles size={18} className="text-morandi-blue mr-2" />
          <h3 className="font-medium">Survey Preview</h3>
        </div>
        <button className="text-morandi-dark/60 hover:text-morandi-dark">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-morandi-gray/30">
          {selectedQuestions.length > 0 ? (
            <>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Selected Questions ({selectedQuestions.length})</h4>
                <ol className="space-y-2 list-decimal list-inside text-morandi-dark/80">
                  {selectedQuestions.map((q, idx) => (
                    <li key={idx}>{q.text}</li>
                  ))}
                </ol>
              </div>
              <div className="flex justify-end">
                <button 
                  className="btn-primary flex items-center"
                  onClick={onGenerateSurvey}
                  disabled={isSurveyGenerating}
                >
                  {isSurveyGenerating ? (
                    <>
                      <span>Generating</span>
                      <span className="ml-2">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Generate Survey
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-morandi-dark/70">Select questions from suggestions to build your survey</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ChatMessage = ({ message, isUser }) => {
  const renderMessageContent = () => {
    if (typeof message.content === 'string') {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    } else if (Array.isArray(message.content)) {
      // Handle structured content with suggestions
      return message.content.map((item, index) => {
        if (item.type === 'text') {
          return <p key={`text-${index}`} className="mb-4 whitespace-pre-wrap">{item.text}</p>;
        } else if (item.type === 'suggestions') {
          return (
            <div key={`suggestions-${index}`} className="mt-2">
              {item.suggestions && item.suggestions.length > 0 && (
                <p className="mb-2 font-medium">Suggested questions:</p>
              )}
            </div>
          );
        }
        return null;
      });
    }
    return <p>{message.content}</p>;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`rounded-lg max-w-3xl ${
        isUser 
          ? 'bg-morandi-blue text-white rounded-tr-none' 
          : 'bg-background-subtle text-morandi-dark rounded-tl-none'
      } px-4 py-3`}>
        {renderMessageContent()}
      </div>
    </div>
  );
};

const ChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionSuggestions, setQuestionSuggestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isSurveyGenerating, setIsSurveyGenerating] = useState(false);
  const [error, setError] = useState('');
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const chatEndRef = useRef(null);
  
  // 设置 API 基础 URL - 使用相对路径
  const API_BASE_URL = '/api';

  // 在 axios 请求中添加 CORS 配置
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: false // 不发送凭证
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation with the agent when component mounts
  useEffect(() => {
    startConversation();
  }, []);

  const startConversation = async () => {
    try {
      setIsLoading(true);
      console.log("Starting conversation with API at:", `${API_BASE_URL}/survey-agent/start`);
      
      const response = await fetch(`${API_BASE_URL}/survey-agent/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received data:", data);
      
      if (!data.question) {
        throw new Error("No question received from API");
      }
      
      setMessages([{ 
        role: 'assistant', 
        content: data.question
      }]);
      
      setConversationStarted(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(`Failed to start conversation. ${err.message}`);
      setIsLoading(false);
      setConversationStarted(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Sending request to process with:", { userResponse: userMessage.content });
      
      // Call the backend API to process the user's response
      const response = await axios.post(`${API_BASE_URL}/survey-agent/process`, {
        userResponse: userMessage.content
      });
      
      console.log("Received process response:", response.data);
      const { question, isComplete } = response.data;
      
      // Add the agent's response to the messages
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: question
      }]);
      
      setIsConversationComplete(isComplete);
      
      // If the conversation is complete, get the generated survey questions
      if (isComplete) {
        console.log("Conversation complete, getting survey questions...");
        const surveyResponse = await axios.get(`${API_BASE_URL}/survey-agent/survey`);
        console.log("Received survey questions:", surveyResponse.data);
        
        setSurveyQuestions(surveyResponse.data.questions);
        
        // Convert the generated questions to the format expected by the SurveyPreview component
        const formattedQuestions = surveyResponse.data.questions.map(q => ({
          id: q.id || Math.random().toString(36).substr(2, 9),
          text: q.question_text,
          type: q.question_type,
          description: q.question_type === 'multiple_choice' ? `Options: ${q.options?.join(', ')}` : undefined
        }));
        
        setQuestionSuggestions(formattedQuestions);
        setSelectedQuestions(formattedQuestions);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error sending message:', err);
      
      // 获取更详细的错误信息
      let errorMessage = 'Failed to get a response. ';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage += `Server error: ${err.response.status}. `;
        if (err.response.data && err.response.data.error) {
          errorMessage += err.response.data.error;
        }
      } else if (err.request) {
        console.error('No response received');
        errorMessage += 'No response from server. Check if the backend is running.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const toggleQuestionSelection = (question) => {
    const isAlreadySelected = selectedQuestions.some(q => q.id === question.id);
    
    if (isAlreadySelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleGenerateSurvey = async () => {
    if (selectedQuestions.length === 0) return;
    
    setIsSurveyGenerating(true);
    
    try {
      console.log("Finalizing survey with selected questions:", selectedQuestions.map(q => q.id));
      
      // Call the backend API to finalize the survey
      const response = await axios.post(`${API_BASE_URL}/survey-agent/finalize`, {
        selectedQuestions: selectedQuestions.map(q => q.id)
      });
      
      console.log("Survey finalized:", response.data);
      
      // Add a confirmation message
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Great! I've generated your survey with ${selectedQuestions.length} questions. You can now find it in your "My Surveys" section.` 
        }
      ]);
      
      setIsSurveyGenerating(false);
    } catch (err) {
      console.error('Error generating survey:', err);
      setError('Failed to generate survey. Please try again.');
      setIsSurveyGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-morandi shadow-morandi overflow-hidden">
      {/* Video background */}
      <div className="relative h-36 overflow-hidden rounded-t-morandi">
        <video 
          className="absolute inset-0 w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="https://cdn.pixabay.com/video/2023/06/23/168485-839220701_medium.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h2 className="text-white text-xl font-medium">AI Survey Assistant</h2>
          <p className="text-white/80 text-sm">Chat with AI to create professional surveys</p>
        </div>
      </div>
      
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button 
            className="ml-auto text-red-700 hover:text-red-900 underline"
            onClick={startConversation}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="p-6 max-h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message} 
            isUser={message.role === 'user'} 
          />
        ))}
        
        {isLoading && (
          <div className="flex mb-4">
            <div className="bg-background-subtle text-morandi-dark/70 rounded-lg rounded-tl-none px-4 py-3">
              <div className="flex space-x-1">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}
        
        {isConversationComplete && questionSuggestions.length > 0 && (
          <div className="my-4">
            <h3 className="font-medium mb-2">Generated Survey Questions:</h3>
            {questionSuggestions.map((question) => (
              <QuestionSuggestion
                key={question.id}
                question={question}
                isSelected={selectedQuestions.some(q => q.id === question.id)}
                onToggle={() => toggleQuestionSelection(question)}
              />
            ))}
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      {selectedQuestions.length > 0 && (
        <SurveyPreview 
          selectedQuestions={selectedQuestions}
          onGenerateSurvey={handleGenerateSurvey}
          isSurveyGenerating={isSurveyGenerating}
        />
      )}
      
      {/* Message Input */}
      <div className="border-t border-morandi-gray/20 p-4">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="input-field flex-grow"
            disabled={isLoading || isConversationComplete}
          />
          <button
            type="submit"
            className={`ml-2 btn-primary ${(isLoading || !input.trim() || isConversationComplete) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || !input.trim() || isConversationComplete}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
  