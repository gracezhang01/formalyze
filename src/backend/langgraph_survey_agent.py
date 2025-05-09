import { useState, useRef, useEffect } from 'react';
import { Send, Download, Check, ChevronUp, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';

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
              <p className="text-morandi-dark/70">Complete all questions to build your survey</p>
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

const ChatInterface = ({ user, onSetActiveTab }) => {
  // 预定义的五个问题
  const predefinedQuestions = [
    {
      id: 1,
      text: "What is the primary purpose of your survey?",
      hint: "e.g., customer satisfaction, market research, employee feedback"
    },
    {
      id: 2,
      text: "Who is your target audience for this survey?",
      hint: "e.g., existing customers, potential customers, employees"
    },
    {
      id: 3,
      text: "How many questions would you like the survey to include?",
      hint: "Recommended: 5-10 for higher completion rates"
    },
    {
      id: 4,
      text: "What specific topics or areas do you want to cover in your survey?",
      hint: "e.g., product features, service quality, user experience"
    },
    {
      id: 5,
      text: "What type of questions would be most helpful for your analysis?",
      hint: "e.g., multiple choice, rating scales, open-ended questions"
    }
  ];

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionSuggestions, setQuestionSuggestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isSurveyGenerating, setIsSurveyGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  
  // API base URL for OpenAI
  const API_BASE_URL = '/api';

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation with first predefined question when component mounts
  useEffect(() => {
    startConversation();
  }, []);

  const startConversation = () => {
    // Show welcome message and first question
    setMessages([
      { 
        role: 'assistant', 
        content: "Welcome to the Survey Creator! I'll help you build a custom survey. Please answer these 5 questions to get started."
      },
      {
        role: 'assistant',
        content: `${predefinedQuestions[0].text}\n\nHint: ${predefinedQuestions[0].hint}`
      }
    ]);
    setCurrentQuestionIndex(0);
    setUserResponses({});
    setIsConversationComplete(false);
    setQuestionSuggestions([]);
    setSelectedQuestions([]);
    setError('');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Store user response
      setUserResponses(prev => ({
        ...prev,
        [predefinedQuestions[currentQuestionIndex].id]: input.trim()
      }));
      
      // Move to next question or complete
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < predefinedQuestions.length) {
        // Show next question
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `${predefinedQuestions[nextIndex].text}\n\nHint: ${predefinedQuestions[nextIndex].hint}`
          }]);
          setCurrentQuestionIndex(nextIndex);
          setIsLoading(false);
        }, 500); // Small delay to simulate thinking
      } else {
        // All questions answered, generate survey questions
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Thank you for your responses! I'll now generate survey questions based on your input. This may take a moment..."
          }]);
          
          setIsLoading(false);
          setIsConversationComplete(true);
          
          // Generate questions using OpenAI API
          generateSurveyQuestions();
        }, 500);
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Failed to process your response. Please try again.');
      setIsLoading(false);
    }
  };

  const generateSurveyQuestions = async () => {
    setIsLoading(true);
    
    try {
      // Call OpenAI API to generate survey questions
      // This is a mock implementation - replace with actual OpenAI API call
      // You'll need to configure the actual endpoint and authentication
      
      const prompt = `Generate a professional survey based on the following requirements:
      
Goal: ${userResponses[1]}
Target audience: ${userResponses[2]}
Information to gather: ${userResponses[3]}
Number of questions: ${userResponses[4]}
Preferred question types: ${userResponses[5]}

Format each question with the following structure:
{
  "question_text": "The question text",
  "question_type": "text/multiple_choice/rating/boolean",
  "required": true/false,
  "options": ["Option 1", "Option 2"] // Only for multiple_choice
}`;

      // Simulating API call to OpenAI
      console.log("Would call OpenAI with prompt:", prompt);
      
      // Simulate API response
      // In a real implementation, replace this with an actual API call
      const mockOpenAIResponse = {
        questions: [
          {
            question_text: "How satisfied are you with our product's ease of use?",
            question_type: "rating",
            required: true,
            options: ["1", "2", "3", "4", "5"]
          },
          {
            question_text: "Which features do you use most often? (Select all that apply)",
            question_type: "multiple_choice",
            required: true,
            options: ["Feature A", "Feature B", "Feature C", "Feature D"]
          },
          {
            question_text: "Have you encountered any technical issues while using our product?",
            question_type: "boolean",
            required: true
          },
          {
            question_text: "What improvements would you suggest for our product?",
            question_type: "text",
            required: false
          },
          {
            question_text: "How likely are you to recommend our product to others?",
            question_type: "rating",
            required: true,
            options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
          }
        ]
      };
      
      // In a real implementation, you would call the OpenAI API something like this:
      /*
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates survey questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Parse the response
      const generatedQuestions = JSON.parse(response.data.choices[0].message.content);
      */
      
      // For now, use the mock response
      const generatedQuestions = mockOpenAIResponse.questions;
      
      // Set the generated questions
      setSurveyQuestions(generatedQuestions);
      
      // Format questions for display
      const formattedQuestions = generatedQuestions.map((q, index) => ({
        id: `q${index + 1}`,
        text: q.question_text,
        type: q.question_type,
        description: q.question_type === 'multiple_choice' ? `Options: ${q.options?.join(', ')}` : undefined
      }));
      
      // Update the UI with the generated questions
      setQuestionSuggestions(formattedQuestions);
      setSelectedQuestions(formattedQuestions);
      
      // Add a message showing the generated questions
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `# Survey Questions\n\n## Description\nBased on your inputs, I've generated the following survey questions:\n\n${generatedQuestions.map((q, i) => 
          `${i+1}. ${q.question_text}${q.options ? `\nOptions: ${q.options.join(', ')}` : ''}`
        ).join('\n\n')}\n\nYou can review these questions and generate your survey when ready.`
      }]);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating survey questions:', err);
      setError('Failed to generate survey questions. Please try again.');
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
    try {
      setIsLoading(true);
      setIsSurveyGenerating(true);
      
      // Extract survey title and description
      const lastMessage = messages[messages.length - 1];
      
      // Use default title and description, or extract from messages
      let title = "Customer Feedback Survey";
      let description = "Survey generated with AI assistance";
      
      // Try to extract title
      const titleMatch = lastMessage.content.match(/# (.*?)(\n|$)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      
      // Try to extract description
      const descriptionMatch = lastMessage.content.match(/## Description\s+(.*?)(\n##|\n\d+\.|\n$)/s);
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
      }
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a survey');
      }
      
      // Format questions for database
      let formattedQuestions = [];
      if (surveyQuestions && Array.isArray(surveyQuestions) && surveyQuestions.length > 0) {
        formattedQuestions = formatQuestionsForDatabase(surveyQuestions);
      } else {
        console.warn("No questions received, using default questions");
        // Set default questions that match required format
        formattedQuestions = [
          {
            id: "q1",
            question_text: "What is your favorite feature?",
            question_type: "short_answer",
            required: true,
            order_index: 1
          },
          {
            id: "q2",
            question_text: "How would you rate our service?",
            question_type: "multiple_choice_single",
            required: true,
            order_index: 2,
            choices: [
              { id: "c1", text: "Excellent", order_index: 1 },
              { id: "c2", text: "Good", order_index: 2 },
              { id: "c3", text: "Average", order_index: 3 },
              { id: "c4", text: "Poor", order_index: 4 }
            ]
          },
          {
            id: "q3",
            question_text: "Which features do you use most? (Select all that apply)",
            question_type: "multiple_choice_multiple",
            required: false,
            order_index: 3,
            choices: [
              { id: "c1", text: "Feature A", order_index: 1 },
              { id: "c2", text: "Feature B", order_index: 2 },
              { id: "c3", text: "Feature C", order_index: 3 }
            ]
          }
        ];
      }
      
      // Prepare survey data for insertion
      const surveyInsertData = {
        title: title,
        description: description,
        created_by: user.id,
        questions: formattedQuestions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };
      
      // Insert survey
      const { data, error } = await supabase
        .from('surveys')
        .insert(surveyInsertData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Show success message
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: `Your survey "${title}" has been created successfully! Redirecting to survey page...`
        }
      ]);
      
      // Add delay to allow user to see success message
      setTimeout(() => {
        // Switch to Surveys tab
        onSetActiveTab('surveys');
      }, 1500);
      
    } catch (err) {
      console.error('Error generating survey:', err);
      setError(`Failed to generate survey: ${err.message}`);
      
      // Show error message
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: `I'm sorry, there was an error creating your survey: ${err.message}. Please try again.`
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsSurveyGenerating(false);
    }
  };

  // Format questions for the database
  const formatQuestionsForDatabase = (questions) => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.warn("No questions to format");
      return [];
    }
    
    return questions.map((q, index) => {
      // Create basic question structure that matches required format
      const formattedQuestion = {
        id: `q${index + 1}`,
        question_text: q.question_text,
        required: q.required || false,
        order_index: index + 1
      };
      
      // Set correct question type and options based on the question type
      if (q.question_type === 'text') {
        // Text question -> short_answer
        formattedQuestion.question_type = 'short_answer';
        // short_answer type doesn't need choices
      } 
      else if (q.question_type === 'multiple_choice') {
        // Check if it's a multiple selection question
        const isMultipleSelection = q.question_text.toLowerCase().includes('select all') || 
                                   q.question_text.toLowerCase().includes('multiple') ||
                                   q.question_text.toLowerCase().includes('choose all');
        
        // Set correct question type
        formattedQuestion.question_type = isMultipleSelection ? 
                                         'multiple_choice_multiple' : 
                                         'multiple_choice_single';
        
        // Create choices array
        formattedQuestion.choices = [];
        
        // If there are options, use them
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
          formattedQuestion.choices = q.options.map((opt, i) => ({
            id: `c${i + 1}`,
            text: opt,
            order_index: i + 1
          }));
        } else {
          // If no options, create default options
          formattedQuestion.choices = [
            { id: "c1", text: "Option 1", order_index: 1 },
            { id: "c2", text: "Option 2", order_index: 2 },
            { id: "c3", text: "Option 3", order_index: 3 }
          ];
        }
      }
      else if (q.question_type === 'rating') {
        // Rating question -> multiple_choice_single
        formattedQuestion.question_type = 'multiple_choice_single';
        
        // Try to extract rating range from question text
        let minRating = 1;
        let maxRating = 5;
        const ratingRangeMatch = q.question_text.match(/scale\s+(?:from|of)\s+(\d+)\s+to\s+(\d+)/i);
        if (ratingRangeMatch) {
          minRating = parseInt(ratingRangeMatch[1]);
          maxRating = parseInt(ratingRangeMatch[2]);
        }
        
        // Create rating options
        formattedQuestion.choices = [];
        for (let i = minRating; i <= maxRating; i++) {
          formattedQuestion.choices.push({
            id: `c${i - minRating + 1}`,
            text: i.toString(),
            order_index: i - minRating + 1
          });
        }
      }
      else if (q.question_type === 'boolean') {
        // Boolean question -> multiple_choice_single
        formattedQuestion.question_type = 'multiple_choice_single';
        
        // Create yes/no options
        formattedQuestion.choices = [
          { id: "c1", text: "Yes", order_index: 1 },
          { id: "c2", text: "No", order_index: 2 }
        ];
      }
      else {
        // Default to short_answer
        formattedQuestion.question_type = 'short_answer';
      }
      
      return formattedQuestion;
    });
  };

  // Function to restart the survey creation process
  const restartSurvey = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setUserResponses({});
    setIsConversationComplete(false);
    setQuestionSuggestions([]);
    setSelectedQuestions([]);
    setError('');
    startConversation();
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
            onClick={restartSurvey}
          >
            Restart
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
      
      {isConversationComplete && selectedQuestions.length > 0 && (
        <SurveyPreview 
          selectedQuestions={selectedQuestions}
          onGenerateSurvey={handleGenerateSurvey}
          isSurveyGenerating={isSurveyGenerating}
        />
      )}
      
      {/* Status Bar - Show progress through questions */}
      {!isConversationComplete && (
        <div className="px-4 py-2 bg-background-subtle border-t border-morandi-gray/20">
          <div className="flex justify-between items-center text-sm text-morandi-dark/60">
            <span>Question {currentQuestionIndex + 1} of {predefinedQuestions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / predefinedQuestions.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-morandi-gray/20 h-1 mt-1 rounded-full overflow-hidden">
            <div 
              className="bg-morandi-blue h-1 rounded-full" 
              style={{ width: `${((currentQuestionIndex + 1) / predefinedQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Message Input */}
      <div className="border-t border-morandi-gray/20 p-4">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConversationComplete ? "Survey generation complete" : "Type your response..."}
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