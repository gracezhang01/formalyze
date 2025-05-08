# src/backend/langgraph_survey_agent.py
import os
import json
import re
import logging
import uuid
from typing import TypedDict, Dict, List, Optional, Any, Tuple
from dotenv import load_dotenv

# LangGraph modules
from langgraph.graph import StateGraph, START, END

# LangChain modules
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class SurveyQuestion:
    """Represents a survey question."""

    def __init__(
        self,
        question_text: str,
        question_type: str,
        options: Optional[List[str]] = None,
        required: bool = True
    ):
        """Initialize a survey question."""
        self.question_text = question_text
        self.question_type = question_type
        self.options = options
        self.required = required

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        result = {
            "question_text": self.question_text,
            "question_type": self.question_type,
            "required": self.required
        }

        if self.options:
            result["options"] = self.options

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SurveyQuestion':
        """Create a SurveyQuestion from a dictionary."""
        return cls(
            question_text=data["question_text"],
            question_type=data["question_type"],
            options=data.get("options"),
            required=data.get("required", True)
        )

# Define workflow state
class State(TypedDict):
    predefined_questions: List[str]           # List of predefined questions
    current_question_index: int               # Current question index
    in_follow_up_mode: bool                   # Whether in follow-up question mode
    follow_up_questions: List[str]            # List of follow-up questions
    current_follow_up_index: int              # Current follow-up question index
    conversation_history: List[Dict[str, str]]  # Conversation history
    user_response: Optional[str]               # User's latest response
    next_question: Optional[str]               # Next question to ask
    is_conversation_complete: bool             # Whether the conversation is complete
    purpose: Optional[str]                     # Survey purpose
    audience: Optional[str]                    # Target audience
    question_count: Optional[int]              # Number of questions
    topics: List[str]                          # List of topics
    question_types: List[str]                  # Question types
    additional_info: Dict[str, Any]            # Additional information
    generated_questions: Optional[List[Dict[str, Any]]]  # Generated questions
    error_message: Optional[str]               # Error message

# Initialize LLM model
def get_llm():
    """Get LLM model instance."""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("Environment variable OPENAI_API_KEY is not set.")
    return ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")

# Node functions

def initialize_state(state: Optional[State] = None) -> State:
    """Initialize state."""
    return {
        "predefined_questions": [
            "What is the primary purpose of your survey? (e.g., customer satisfaction, market research, employee feedback)",
            "Who is your target audience for this survey?",
            "How many questions would you like the survey to include?",
        ],
        "current_question_index": 0,
        "in_follow_up_mode": False,
        "follow_up_questions": [],
        "current_follow_up_index": 0,
        "conversation_history": [],
        "user_response": None,
        "next_question": None,
        "is_conversation_complete": False,
        "purpose": None,
        "audience": None,
        "question_count": None,
        "topics": [],
        "question_types": [],
        "additional_info": {},
        "generated_questions": None,
        "error_message": None
    }

def start_conversation(state: State) -> State:
    """Start the conversation with the first predefined question."""
    first_question = state["predefined_questions"][0]

    # Add to conversation history
    state["conversation_history"].append({
        "role": "assistant",
        "content": first_question
    })

    state["next_question"] = first_question
    return state

def process_user_response(state: State) -> State:
    """Process the user's response and determine the next question."""
    user_response = state["user_response"]
    if not user_response:
        state["error_message"] = "No user response provided"
        return state

    # Add user response to conversation history
    state["conversation_history"].append({
        "role": "user",
        "content": user_response
    })

    # Process the current state
    if state["in_follow_up_mode"]:
        # We're processing a follow-up question

        # Update requirements based on the follow-up
        state = update_requirements_from_response(state)

        # Move to the next follow-up or main question
        state["current_follow_up_index"] += 1

        if state["current_follow_up_index"] >= len(state["follow_up_questions"]):
            # We've processed all follow-ups for this main question
            state["in_follow_up_mode"] = False
            state["current_question_index"] += 1

            # Check if we've completed all predefined questions
            if state["current_question_index"] >= len(state["predefined_questions"]):
                # Conversation is complete
                completion_message = "Thank you for providing all the information. I'll now generate survey questions based on your requirements."

                # Add to conversation history
                state["conversation_history"].append({
                    "role": "assistant",
                    "content": completion_message
                })

                state["is_conversation_complete"] = True
                state["next_question"] = completion_message
                return state

            # Get the next main question
            next_question = state["predefined_questions"][state["current_question_index"]]

            # Add to conversation history
            state["conversation_history"].append({
                "role": "assistant",
                "content": next_question
            })

            state["next_question"] = next_question
            return state
        else:
            # Ask the next follow-up question
            next_question = state["follow_up_questions"][state["current_follow_up_index"]]

            # Add to conversation history
            state["conversation_history"].append({
                "role": "assistant",
                "content": next_question
            })

            state["next_question"] = next_question
            return state
    else:
        # We're processing a main question

        # Update requirements based on main question
        state = update_requirements_from_main_question(state)

        # 只为主要预定义问题生成跟进问题
        state = generate_follow_up_questions(state)
        follow_ups = state["follow_up_questions"]

        if follow_ups:
            # We have follow-up questions to ask
            state["in_follow_up_mode"] = True
            state["current_follow_up_index"] = 0

            # Ask the first follow-up
            next_question = state["follow_up_questions"][0]

            # Add to conversation history
            state["conversation_history"].append({
                "role": "assistant",
                "content": next_question
            })

            state["next_question"] = next_question
            return state
        else:
            # No follow-ups, move to next main question
            state["current_question_index"] += 1

            # Check if we've completed all predefined questions
            if state["current_question_index"] >= len(state["predefined_questions"]):
                # Conversation is complete
                completion_message = "Thank you for providing all the information. I'll now generate survey questions based on your requirements."

                # Add to conversation history
                state["conversation_history"].append({
                    "role": "assistant",
                    "content": completion_message
                })

                state["is_conversation_complete"] = True
                state["next_question"] = completion_message
                return state

            # Get the next main question
            next_question = state["predefined_questions"][state["current_question_index"]]

            # Add to conversation history
            state["conversation_history"].append({
                "role": "assistant",
                "content": next_question
            })

            state["next_question"] = next_question
            return state

def update_requirements_from_main_question(state: State) -> State:
    """Update survey requirements based on a main question answer."""
    question = state["predefined_questions"][state["current_question_index"]]
    answer = state["user_response"]

    # Parse the answer based on which question was asked
    if "purpose" in question.lower():
        state["purpose"] = answer
    elif "audience" in question.lower():
        state["audience"] = answer
    elif "how many questions" in question.lower():
        # Try to extract a number
        try:
            # Look for numbers in the answer
            numbers = re.findall(r'\d+', answer)
            if numbers:
                state["question_count"] = int(numbers[0])
            else:
                # Parse text representations of numbers
                if "few" in answer.lower() or "short" in answer.lower():
                    state["question_count"] = 5
                elif "medium" in answer.lower():
                    state["question_count"] = 10
                elif "many" in answer.lower() or "comprehensive" in answer.lower():
                    state["question_count"] = 15
                else:
                    # Default value
                    state["question_count"] = 10
        except:
            # Default to 10 questions if parsing fails
            state["question_count"] = 10
    elif "topics" in question.lower() or "areas" in question.lower():
        # Split by commas, semicolons, or "and"
        topics = re.split(r',|;|\s+and\s+', answer)
        state["topics"] = [topic.strip() for topic in topics if topic.strip()]
    elif "type of questions" in question.lower():
        # Check for different question types
        question_types = []
        if "multiple choice" in answer.lower():
            question_types.append("multiple_choice")
        if "rating" in answer.lower() or "scale" in answer.lower():
            question_types.append("rating")
        if "open" in answer.lower() or "text" in answer.lower():
            question_types.append("text")
        if "yes/no" in answer.lower() or "boolean" in answer.lower():
            question_types.append("boolean")

        # If no specific types were mentioned, include all types
        if not question_types:
            question_types = ["multiple_choice", "rating", "text", "boolean"]

        state["question_types"] = question_types

    return state

def update_requirements_from_response(state: State) -> State:
    """Update requirements based on any response."""
    answer = state["user_response"]

    # Get the current question being answered
    if state["in_follow_up_mode"]:
        question = state["follow_up_questions"][state["current_follow_up_index"]]
    else:
        question = state["predefined_questions"][state["current_question_index"]]

    # Store in additional info
    key = question.lower().replace("?", "").strip()
    # Truncate key to a reasonable length
    if len(key) > 50:
        key = key[:50] + "..."

    state["additional_info"][key] = answer

    # If the response provides more specifics about existing requirements, update them
    if "purpose" in question.lower() and state["purpose"]:
        state["purpose"] += f" - {answer}"
    elif "audience" in question.lower() and state["audience"]:
        state["audience"] += f" - {answer}"
    elif "topics" in question.lower() and state["topics"]:
        # Split by commas, semicolons, or "and"
        topics = re.split(r',|;|\s+and\s+', answer)
        new_topics = [topic.strip() for topic in topics if topic.strip()]
        state["topics"].extend(new_topics)

    return state

def generate_follow_up_questions(state: State) -> State:
    """Generate follow-up questions based on the main question and user response."""
    user_response = state["user_response"]
    current_question_index = state["current_question_index"]
    
    # 检查用户回答是否是简短或否定回答
    short_negative_responses = ["no", "nope", "n/a", "none", "i don't know", "idk", "not sure", "nothing"]
    if user_response.lower().strip() in short_negative_responses or len(user_response.strip()) < 5:
        # 即使是简短回答，也生成一个跟进问题
        state["follow_up_questions"] = ["Could you please elaborate a bit more?"]
        return state

    # Get the current main question
    main_question = state["predefined_questions"][current_question_index]

    # Create the prompt for follow-up questions
    prompt = f"""
    The user is designing a survey. They were asked:
    "{main_question}"

    And they responded:
    "{user_response}"

    Generate 1-2 specific follow-up questions that would help clarify or expand
    on their answer. These questions should help gather more specific information
    for creating a targeted survey.

    IMPORTANT: Always generate at least one follow-up question, unless the user's response is extremely detailed and complete.

    Format your response as a JSON array of strings, just the questions themselves.
    Example: ["Question 1?", "Question 2?"]
    """

    # Use LLM to generate follow-up questions
    llm = get_llm()
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content

        try:
            # Try to extract a JSON array from the response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)

            if json_match:
                json_str = json_match.group(0)
                follow_up_questions = json.loads(json_str)
                # 确保至少有一个跟进问题
                if not follow_up_questions:
                    follow_up_questions = ["Could you please provide more details about your answer?"]
                # 限制跟进问题数量不超过2个
                state["follow_up_questions"] = follow_up_questions[:2]
            else:
                # If no JSON array was found, try to parse the entire response
                follow_up_questions = json.loads(content)
                # 确保至少有一个跟进问题
                if not follow_up_questions:
                    follow_up_questions = ["Could you please provide more details about your answer?"]
                # 限制跟进问题数量不超过2个
                state["follow_up_questions"] = follow_up_questions[:2]
        except Exception as e:
            logger.error(f"Error parsing follow-up questions: {e}")
            # 如果解析失败，提供一个默认的跟进问题
            state["follow_up_questions"] = ["Could you please provide more details about your answer?"]

    except Exception as e:
        logger.error(f"Error calling LLM: {e}")
        # 如果调用LLM失败，提供一个默认的跟进问题
        state["follow_up_questions"] = ["Could you please provide more details about your answer?"]

    return state

def generate_survey(state: State) -> State:
    """Generate survey questions based on the collected requirements."""
    # Ensure we have the basic requirements
    if not state.get("purpose"):
        state["purpose"] = "general feedback"
    
    if not state.get("question_count"):
        state["question_count"] = 5
    
    # Create a formatted summary of the requirements
    requirements_summary = f"""
    Survey Purpose: {state.get("purpose") or 'Not specified'}
    Target Audience: {state.get("audience") or 'Not specified'}
    Number of Questions: {state.get("question_count") or 5}
    Topics to Cover: {', '.join(state.get("topics", [])) or 'Not specified'}
    Question Types to Include: {', '.join(state.get("question_types", [])) or 'All types'}

    Additional Information:
    """
    if state.get("additional_info"):
        for key, value in state.get("additional_info", {}).items():
            requirements_summary += f"- {key}: {value}\n"

    # Create the prompt for generating survey questions
    prompt = f"""
    Generate a professional survey based on the following requirements:

    {requirements_summary}

    Generate exactly {state.get("question_count") or 5} survey questions
    that address the specified purpose, target audience, and topics.
    Include a mix of the following question types: {', '.join(state.get("question_types", [])) or 'multiple_choice, rating, text, boolean'}.

    For each question, specify:
    1. The question text
    2. The question type (multiple_choice, text, rating, boolean)
    3. Options (for multiple choice questions)
    4. Whether the question is required

    Format your response as a JSON array of question objects:
    [
        {{
            "question_text": "Question here?",
            "question_type": "multiple_choice|text|rating|boolean",
            "options": ["Option 1", "Option 2", ...],  // Only for multiple_choice
            "required": true|false
        }},
        ...
    ]
    """

    # Use LLM to generate survey questions
    llm = get_llm()
    try:
        print("Calling LLM to generate survey questions...")
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content
        print(f"LLM response received: {content[:100]}...")  # 只打印前100个字符
        
        try:
            # Try to extract a JSON array from the response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
                questions = json.loads(json_str)
                state["generated_questions"] = questions
                print(f"Successfully parsed {len(questions)} questions from LLM response.")
            else:
                # If no JSON array was found, try to parse the entire response
                questions = json.loads(content)
                state["generated_questions"] = questions
                print(f"Successfully parsed {len(questions)} questions from LLM response (full content).")
        except Exception as e:
            print(f"Error parsing generated questions: {e}")
            # Return a basic set of questions if parsing fails
            state["generated_questions"] = [
                {
                    "question_text": f"How would you rate your experience with {state.get('purpose') or 'our service'}?",
                    "question_type": "rating",
                    "required": True
                },
                {
                    "question_text": "What could be improved?",
                    "question_type": "text",
                    "required": False
                }
            ]
            print("Using fallback questions due to parsing error.")
            
    except Exception as e:
        print(f"Error calling LLM: {e}")
        # Return a basic set of questions
        state["generated_questions"] = [
            {
                "question_text": f"How would you rate your experience with {state.get('purpose') or 'our service'}?",
                "question_type": "rating",
                "required": True
            },
            {
                "question_text": "What could be improved?",
                "question_type": "text",
                "required": False
            }
        ]
        print("Using fallback questions due to LLM error.")
    
    return state

def finalize_result(state: State) -> State:
    """Finalize the process and prepare the final result."""
    # If questions haven't been generated yet, generate them now
    if not state["generated_questions"]:
        state = generate_survey(state)
    
    logger.info("Survey generation complete. Generated %d questions.", len(state["generated_questions"]))
    
    return state

# ===================== Build LangGraph Workflow =====================

def build_survey_graph():
    """Build the survey generation workflow graph."""
    # Create state graph
    graph = StateGraph(State)
    
    # Add nodes
    graph.add_node("initialize_state", initialize_state)
    graph.add_node("start_conversation", start_conversation)
    graph.add_node("process_user_response", process_user_response)
    graph.add_node("generate_survey", generate_survey)
    graph.add_node("finalize_result", finalize_result)
    
    # Start edges
    graph.add_edge(START, "initialize_state")
    graph.add_edge("initialize_state", "start_conversation")
    graph.add_edge("start_conversation", "process_user_response")
    
    # Define conditional routing - after processing user response, check if conversation is complete
    def route_after_response(state: State) -> str:
        if state["is_conversation_complete"]:
            return "generate_survey"
        else:
            return END
    
    graph.add_conditional_edges(
        "process_user_response",
        route_after_response,
        {
            END: END,
            "generate_survey": "generate_survey"
        }
    )
    
    # Completion edges
    graph.add_edge("generate_survey", "finalize_result")
    graph.add_edge("finalize_result", END)
    
    # Compile graph
    return graph.compile()

# ============== External Interface Class ==============

class LangGraphSurveyAgent:
    """Survey generation agent using LangGraph."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the agent."""
        # Set API key
        if api_key:
            os.environ["OPENAI_API_KEY"] = "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"
            
        # Build workflow graph
        self.graph = build_survey_graph()
        
        # Initialize session state
        self.session_id = str(uuid.uuid4())
        self.state = None
        self.started = False
    
    def start_conversation(self) -> str:
        """Start the conversation with the first predefined question."""
        # Reset state
        self.started = True
        
        # 初始化状态，以防 invoke 返回 None
        self.state = initialize_state()
        
        try:
            # Run the first two nodes of the graph
            config = {"recursion_limit": 10}  # 增加递归限制
            result = self.graph.invoke(
                {},
                config=config,
                stream_mode=False
            )
            
            # 检查返回值类型
            if result is not None:
                if isinstance(result, list):
                    # 如果是列表，取最后一个事件的状态
                    if result and len(result) > 0:
                        self.state = result[-1].get("state", self.state)
                else:
                    self.state = result
        except Exception as e:
            print(f"Error during graph invocation: {e}")
            # 保持使用初始化的状态
        
        # 确保 state 不是 None
        if self.state is None:
            self.state = initialize_state()
            # 手动调用 start_conversation 函数来获取第一个问题
            self.state = start_conversation(self.state)
        
        # 确保有预定义问题
        if not self.state.get("next_question") and isinstance(self.state, dict):
            # 如果没有设置 next_question，手动设置为第一个预定义问题
            predefined_questions = self.state.get("predefined_questions", [])
            if predefined_questions:
                self.state["next_question"] = predefined_questions[0]
                # 添加到对话历史
                if "conversation_history" in self.state:
                    self.state["conversation_history"].append({
                        "role": "assistant",
                        "content": predefined_questions[0]
                    })
        
        # Return the first question
        first_question = self.state.get("next_question", "What is the primary purpose of your survey?")
        return first_question
    def process_response(self, user_response: str) -> Tuple[str, bool]:
        """Process the user's response and determine the next question."""
        if not self.started:
            raise ValueError("Must call start_conversation() first")
        
        # 创建一个新的状态，而不是修改当前状态
        # 这样可以确保每次调用 invoke 时都从头开始执行图
        new_state = initialize_state()
        new_state["user_response"] = user_response
        
        # 复制当前状态的重要信息
        if isinstance(self.state, dict):
            new_state["conversation_history"] = self.state.get("conversation_history", [])
            new_state["current_question_index"] = self.state.get("current_question_index", 0)
            new_state["in_follow_up_mode"] = self.state.get("in_follow_up_mode", False)
            new_state["follow_up_questions"] = self.state.get("follow_up_questions", [])
            new_state["current_follow_up_index"] = self.state.get("current_follow_up_index", 0)
            new_state["purpose"] = self.state.get("purpose")
            new_state["audience"] = self.state.get("audience")
            new_state["question_count"] = self.state.get("question_count")
            new_state["topics"] = self.state.get("topics", [])
            new_state["question_types"] = self.state.get("question_types", [])
            new_state["additional_info"] = self.state.get("additional_info", {})
        
        # 直接调用 process_user_response 函数处理用户响应
        updated_state = process_user_response(new_state)
        self.state = updated_state
        
        # Return next question and whether conversation is complete
        next_question = self.state.get("next_question", "")
        is_complete = self.state.get("is_conversation_complete", False)
        
        return next_question, is_complete
    
    def generate_survey_questions(self) -> List[Dict[str, Any]]:
        """Generate survey questions."""
        if not self.state:
            raise ValueError("No state available. Start conversation first.")
        
        # 如果对话尚未完成，尝试完成它
        if not self.state.get("is_conversation_complete", False):
            print("Warning: Conversation not marked as complete, but generating survey anyway.")
        
        # 如果问题尚未生成，手动调用 generate_survey 函数
        if not self.state.get("generated_questions"):
            print("Generating survey questions...")
            self.state = generate_survey(self.state)
        
        # 确保生成了问题
        if not self.state.get("generated_questions"):
            print("Failed to generate questions through normal flow, using fallback method.")
            # 使用备用方法生成基本问题
            self.state["generated_questions"] = [
                {
                    "question_text": f"How would you rate your experience with {self.state.get('purpose') or 'our service'}?",
                    "question_type": "rating",
                    "required": True
                },
                {
                    "question_text": "What could be improved?",
                    "question_type": "text",
                    "required": False
                }
            ]
        
        return self.state["generated_questions"]
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get conversation history."""
        if not self.state:
            return []
        
        return self.state["conversation_history"]
    
    def get_survey_requirements(self) -> Dict[str, Any]:
        """Get the current survey requirements."""
        if not self.state:
            return {}
        
        return {
            "purpose": self.state.get("purpose"),
            "audience": self.state.get("audience"),
            "question_count": self.state.get("question_count"),
            "topics": self.state.get("topics", []),
            "question_types": self.state.get("question_types", []),
            "additional_info": self.state.get("additional_info", {})
        }

# ============== Test Script ==============

def test_survey_agent():
    """Test the survey generation agent."""
    print_colored = lambda text, color_code: print(f"\033[{color_code}m{text}\033[0m")
    
    print_colored("=== LangGraph Survey Generation Agent Test ===", 1)
    
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print_colored("⚠️  No OpenAI API key found in environment variables or .env file", 31)
        api_key = input("Please enter your OpenAI API key: ")
        if not api_key:
            print_colored("❌ No API key provided. Exiting.", 31)
            return
    
    # Initialize agent
    print_colored("🔄 Initializing agent...", 35)
    agent = LangGraphSurveyAgent(api_key=api_key)
    
    # Start conversation
    question = agent.start_conversation()
    print_colored(f"🤖 Agent: {question}", 32)
    
    # Main conversation loop
    is_complete = False
    while not is_complete:
        # Get user input
        user_response = input("👤 You: ")
        
        # Process response
        question, is_complete = agent.process_response(user_response)
        print_colored(f"🤖 Agent: {question}", 32)
    
    # Generate survey questions
    print_colored("🔄 Generating survey questions...", 35)
    survey_questions = agent.generate_survey_questions()
    
    # Print final survey
    print_colored("\n=== Generated Survey ===", 1)
    print_colored(json.dumps(survey_questions, indent=2), 33)
    
    # Print survey requirements
    print_colored("\n=== Survey Requirements ===", 1)
    print_colored(json.dumps(agent.get_survey_requirements(), indent=2), 33)
    
    # Print conversation history
    print_colored("\n=== Conversation History ===", 1)
    for turn in agent.get_conversation_history():
        if turn["role"] == "assistant":
            print_colored(f"🤖 Agent: {turn['content']}", 32)
        else:
            print_colored(f"👤 User: {turn['content']}", 36)
    
    print_colored("\n=== Test Complete ===", 1)

if __name__ == "__main__":
    test_survey_agent()