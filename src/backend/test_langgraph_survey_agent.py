# src/backend/test_langgraph_survey_agent.py
import os
import uuid
import json
from dotenv import load_dotenv
from langgraph_survey_agent import LangGraphSurveyAgent

# Load environment variables
load_dotenv()

def print_colored(text, color_code):
    """Print text with color."""
    print(f"\033[{color_code}m{text}\033[0m")

def print_agent_message(message):
    """Print a message from the agent with color."""
    print_colored(f"🤖 Agent: {message}", 32)  # Green

def print_user_message(message):
    """Print a user message with color."""
    print_colored(f"👤 You: {message}", 36)  # Cyan

def print_json(data):
    """Print JSON data with nice formatting."""
    print_colored(json.dumps(data, indent=2), 33)  # Yellow

def main():
    """Run a terminal test for the survey agent."""
    print_colored("=== LangGraph Survey Generation Agent Terminal Test ===", 1)
    
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print_colored("⚠️  No OpenAI API key found in environment variables or .env file", 31)
        api_key = input("Please enter your OpenAI API key: ")
        if not api_key:
            print_colored("❌ No API key provided. Exiting.", 31)
            return
    
    # Create a session ID
    session_id = str(uuid.uuid4())
    print_colored(f"📝 Session ID: {session_id}", 35)
    
    # Initialize the agent
    print_colored("🔄 Initializing agent...", 35)
    agent = LangGraphSurveyAgent(api_key=api_key)
    
    # Start the conversation
    question = agent.start_conversation()
    print_agent_message(question)
    
    # Main conversation loop
    is_complete = False
    while not is_complete:
        # Get user input
        user_response = input("👤 You: ")
        
        # Process the response
        question, is_complete = agent.process_response(user_response)
        print_agent_message(question)
    
    # Generate survey questions
    print_colored("🔄 Generating survey questions...", 35)
    survey_questions = agent.generate_survey_questions()
    
    # Print the final survey
    print_colored("\n=== Generated Survey ===", 1)
    print_json(survey_questions)
    
    # Print survey requirements
    print_colored("\n=== Survey Requirements ===", 1)
    print_json(agent.get_survey_requirements())
    
    # Print conversation history
    print_colored("\n=== Conversation History ===", 1)
    for turn in agent.get_conversation_history():
        if turn["role"] == "assistant":
            print_colored(f"🤖 Agent: {turn['content']}", 32)
        else:
            print_colored(f"👤 User: {turn['content']}", 36)
    
    print_colored("\n=== Test Complete ===", 1)

if __name__ == "__main__":
    main()