
import { useState, useRef, useEffect } from 'react';
import { Send, Download, Check, ChevronUp, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';

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
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your AI survey assistant. Describe the type of survey you want to create, and I\'ll suggest relevant questions. What kind of information are you looking to collect?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionSuggestions, setQuestionSuggestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isSurveyGenerating, setIsSurveyGenerating] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock question suggestions based on common survey topics
  const generateSuggestions = (userQuery) => {
    const query = userQuery.toLowerCase();
    let suggestions = [];
    
    if (query.includes('customer') || query.includes('satisfaction') || query.includes('feedback')) {
      suggestions = [
        { id: 1, text: 'How satisfied are you with our product/service?', type: 'rating', description: 'Scale from 1-10' },
        { id: 2, text: 'What aspects of our product/service do you like the most?', type: 'open' },
        { id: 3, text: 'What improvements would you suggest for our product/service?', type: 'open' },
        { id: 4, text: 'How likely are you to recommend us to a friend or colleague?', type: 'nps', description: 'NPS question (0-10 scale)' },
        { id: 5, text: 'Did our product/service meet your expectations?', type: 'multiple' },
      ];
    } else if (query.includes('event') || query.includes('workshop') || query.includes('conference')) {
      suggestions = [
        { id: 1, text: 'How would you rate the overall quality of the event?', type: 'rating' },
        { id: 2, text: 'Which sessions did you find most valuable?', type: 'multiple' },
        { id: 3, text: 'How was the event location and facilities?', type: 'rating' },
        { id: 4, text: 'Would you attend a similar event in the future?', type: 'boolean' },
        { id: 5, text: 'Do you have any suggestions for future events?', type: 'open' },
      ];
    } else if (query.includes('employee') || query.includes('work') || query.includes('job')) {
      suggestions = [
        { id: 1, text: 'How satisfied are you with your current role?', type: 'rating' },
        { id: 2, text: 'Do you feel your work is valued by the organization?', type: 'boolean' },
        { id: 3, text: 'What aspects of your workplace would you like to see improved?', type: 'open' },
        { id: 4, text: 'How would you rate the work-life balance in your role?', type: 'rating' },
        { id: 5, text: 'Do you feel you have opportunities for career growth?', type: 'multiple' },
      ];
    } else if (query.includes('health') || query.includes('wellness') || query.includes('fitness')) {
      suggestions = [
        { id: 1, text: 'How would you rate your current health status?', type: 'rating' },
        { id: 2, text: 'How many times per week do you exercise?', type: 'number' },
        { id: 3, text: 'What are your primary fitness goals?', type: 'checkbox' },
        { id: 4, text: 'Do you follow any specific diet or nutrition plan?', type: 'multiple' },
        { id: 5, text: 'What health challenges are you currently facing?', type: 'open' },
      ];
    } else if (query.includes('education') || query.includes('course') || query.includes('training')) {
      suggestions = [
        { id: 1, text: 'How would you rate the quality of instruction?', type: 'rating' },
        { id: 2, text: 'Was the course material relevant to your needs?', type: 'boolean' },
        { id: 3, text: 'What topics would you like to see covered in future courses?', type: 'open' },
        { id: 4, text: 'How likely are you to apply what you learned?', type: 'rating' },
        { id: 5, text: 'Would you recommend this course to others?', type: 'boolean' },
      ];
    } else {
      // Default suggestions
      suggestions = [
        { id: 1, text: 'What is your age range?', type: 'multiple' },
        { id: 2, text: 'How did you hear about us?', type: 'multiple' },
        { id: 3, text: 'What improvements would you suggest?', type: 'open' },
        { id: 4, text: 'How likely are you to recommend us to others?', type: 'rating' },
        { id: 5, text: 'Would you use our service again in the future?', type: 'boolean' },
      ];
    }
    
    return suggestions;
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
      // In a real implementation, this would call the OpenAI API
      // For now, we'll simulate the AI response with a delay
      setTimeout(() => {
        const newSuggestions = generateSuggestions(userMessage.content);
        setQuestionSuggestions(newSuggestions);
        
        const aiResponse = { 
          role: 'assistant', 
          content: `I've analyzed your request for a survey about "${userMessage.content}". Here are some suggested questions that might be helpful for your survey. You can select any questions you'd like to include:` 
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get a response. Please try again.');
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

  const handleGenerateSurvey = () => {
    if (selectedQuestions.length === 0) return;
    
    setIsSurveyGenerating(true);
    
    // Simulate survey generation
    setTimeout(() => {
      setIsSurveyGenerating(false);
      
      // Add a confirmation message
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Great! I've generated your survey with ${selectedQuestions.length} questions. You can now find it in your "My Surveys" section.` 
        }
      ]);
      
      // Reset selections after successful generation
      setSelectedQuestions([]);
      setQuestionSuggestions([]);
    }, 2000);
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
        
        {questionSuggestions.length > 0 && (
          <div className="my-4">
            <h3 className="font-medium mb-2">Suggested Questions:</h3>
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
            placeholder="Type your survey requirements..."
            className="input-field flex-grow"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`ml-2 btn-primary ${(isLoading || !input.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
  