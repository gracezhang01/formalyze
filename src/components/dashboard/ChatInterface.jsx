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

const ChatInterface = ({ user, onSetActiveTab }) => {
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

  const handleSurveyQuestionsReceived = (questions) => {
    console.log("Received survey questions:", questions);
    setSurveyQuestions(questions.questions || []);
  };

  const handleGenerateSurvey = async () => {
    try {
      setIsLoading(true);
      setIsSurveyGenerating(true);
      
      // 从消息中提取调查问卷标题和描述
      const lastMessage = messages[messages.length - 1];
      console.log("Last message content for survey generation:", lastMessage.content);
      
      // 使用默认标题和描述，或者从消息中提取
      let title = "Customer Feedback Survey";
      let description = "Survey generated with AI assistance";
      
      // 尝试从消息中提取标题
      const titleMatch = lastMessage.content.match(/# (.*?)(\n|$)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      
      // 尝试从消息中提取描述
      const descriptionMatch = lastMessage.content.match(/## Description\s+(.*?)(\n##|\n\d+\.|\n$)/s);
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
      }
      
      // 获取当前用户ID
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user for survey creation:", user);
      
      if (!user) {
        throw new Error('You must be logged in to create a survey');
      }
      
      // 使用系统接收到的问题
      console.log("Using received survey questions:", surveyQuestions);
      
      // 格式化问题
      let formattedQuestions = [];
      if (surveyQuestions && Array.isArray(surveyQuestions) && surveyQuestions.length > 0) {
        formattedQuestions = formatQuestionsForDatabase(surveyQuestions);
      } else {
        console.warn("No questions received, using default questions");
        // 设置默认问题，完全匹配所需格式
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
      
      console.log("Formatted questions for database:", formattedQuestions);
      
      // 准备要插入的调查问卷数据
      const surveyInsertData = {
        title: title,
        description: description,
        created_by: user.id,
        questions: formattedQuestions,  // 使用格式化后的问题
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };
      
      console.log("Inserting survey with data:", surveyInsertData);
      
      // 插入调查问卷
      const { data, error } = await supabase
        .from('surveys')
        .insert(surveyInsertData)
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting survey:", error);
        throw error;
      }
      
      console.log('Survey saved successfully:', data);
      
      // 显示成功消息
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: `Your survey "${title}" has been created successfully! You can view it in your dashboard. [View Survey](${window.location.origin}/dashboard)`
        }
      ]);
      
    } catch (err) {
      console.error('Error generating survey:', err);
      setError(`Failed to generate survey: ${err.message}`);
      
      // 显示错误消息
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

  // 辅助函数，将我们的问题类型映射到数据库中使用的类型
  const mapQuestionType = (type) => {
    switch (type) {
      case 'text':
        return 'short_answer';
      case 'multiple':
        return 'multiple_choice_single';
      case 'boolean':
        return 'yes_no';
      case 'rating':
        return 'rating';
      default:
        return 'short_answer';
    }
  };

  // 从消息中解析调查问卷数据
  const parseSurveyFromMessage = (messageContent) => {
    // 这个函数需要根据你的 AI 返回的格式来实现
    
    // 尝试找到标题
    let title = 'Customer Feedback Survey'; // 默认标题
    
    // 提取问题
    const questions = [];
    const questionMatches = messageContent.match(/\d+\.\s+(.*?)(?=\d+\.|$)/gs);
    
    if (questionMatches) {
      questionMatches.forEach((match, index) => {
        const questionText = match.replace(/^\d+\.\s+/, '').trim();
        
        // 检测问题类型和选项
        let type = 'text';
        let options = null;
        
        // 检查是否包含选项
        if (questionText.includes('Options:')) {
          const parts = questionText.split('Options:');
          const text = parts[0].trim();
          const optionsText = parts[1].trim();
          
          // 解析选项
          options = optionsText.split(',').map(opt => opt.trim());
          
          // 确定问题类型
          if (optionsText.toLowerCase().includes('yes') && optionsText.toLowerCase().includes('no')) {
            type = 'boolean';
          } else if (optionsText.match(/\d+/g) && optionsText.match(/\d+/g).length > 1) {
            type = 'rating';
          } else {
            type = 'multiple';
          }
          
          questions.push({
            text,
            type,
            required: index < 3, // 假设前三个问题是必填的
            options
          });
        } else {
          questions.push({
            text: questionText,
            type: 'text',
            required: index < 3
          });
        }
      });
    }
    
    return {
      title,
      description: 'Survey generated with AI assistance',
      questions
    };
  };

  // 完全重写 formatQuestionsForDatabase 函数以匹配所需格式

  const formatQuestionsForDatabase = (questions) => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.warn("No questions to format");
      return [];
    }
    
    console.log("Original questions to format:", questions);
    
    return questions.map((q, index) => {
      // 创建基本问题结构，完全匹配所需格式
      const formattedQuestion = {
        id: `q${index + 1}`,  // 使用 q1, q2, q3 格式
        question_text: q.question_text,
        required: q.required || false,
        order_index: index + 1  // 使用 order_index 而不是 position
      };
      
      // 根据问题类型设置正确的类型
      if (q.question_type === 'text') {
        // 文本问题 -> short_answer
        formattedQuestion.question_type = 'short_answer';
        // short_answer 类型不需要 choices
      } 
      else if (q.question_type === 'multiple_choice') {
        // 检查是否是多选题
        const isMultipleSelection = q.question_text.toLowerCase().includes('select all') || 
                                   q.question_text.toLowerCase().includes('multiple') ||
                                   q.question_text.toLowerCase().includes('choose all');
        
        // 设置正确的问题类型
        formattedQuestion.question_type = isMultipleSelection ? 
                                         'multiple_choice_multiple' : 
                                         'multiple_choice_single';
        
        // 创建 choices 数组
        formattedQuestion.choices = [];
        
        // 如果有选项，使用它们
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
          formattedQuestion.choices = q.options.map((opt, i) => ({
            id: `c${i + 1}`,  // 使用 c1, c2, c3 格式
            text: opt,
            order_index: i + 1
          }));
        } else {
          // 如果没有选项，创建默认选项
          formattedQuestion.choices = [
            { id: "c1", text: "Option 1", order_index: 1 },
            { id: "c2", text: "Option 2", order_index: 2 },
            { id: "c3", text: "Option 3", order_index: 3 }
          ];
        }
      }
      else if (q.question_type === 'rating') {
        // 评分问题 -> multiple_choice_single
        formattedQuestion.question_type = 'multiple_choice_single';
        
        // 尝试从问题文本中提取评分范围
        let minRating = 1;
        let maxRating = 5;
        const ratingRangeMatch = q.question_text.match(/scale\s+(?:from|of)\s+(\d+)\s+to\s+(\d+)/i);
        if (ratingRangeMatch) {
          minRating = parseInt(ratingRangeMatch[1]);
          maxRating = parseInt(ratingRangeMatch[2]);
        }
        
        // 创建评分选项
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
        // 布尔问题 -> multiple_choice_single
        formattedQuestion.question_type = 'multiple_choice_single';
        
        // 创建是/否选项
        formattedQuestion.choices = [
          { id: "c1", text: "Yes", order_index: 1 },
          { id: "c2", text: "No", order_index: 2 }
        ];
      }
      else {
        // 默认为 short_answer
        formattedQuestion.question_type = 'short_answer';
      }
      
      return formattedQuestion;
    });
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
  