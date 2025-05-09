import json
import os
import sys
import traceback
from urllib.parse import parse_qs

# Add project root directory to Python path to ensure backend modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Debug information
print("Current directory:", os.getcwd())
print("Python path:", sys.path)

# Try to import LangGraph agent
try:
    from src.backend.langgraph_survey_agent import LangGraphSurveyAgent
    print("Successfully imported LangGraphSurveyAgent")
except ImportError as e:
    print(f"Failed to import LangGraphSurveyAgent: {e}")
    traceback.print_exc()

# Global variable to store agent instances (Note: this may reset between calls in serverless environments)
agent_instances = {}

def handler(event, context):
    """Vercel serverless function handler - unified handler for all survey-agent routes"""
    try:
        # Get request data
        path = event.get('path', '')
        method = event.get('httpMethod', 'GET')
        
        print(f"Processing request: {path} ({method})")
        
        # Handle CORS preflight requests
        if method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, x-session-id'
                },
                'body': ''
            }
        
        # Get or create agent instance
        session_id = event.get('headers', {}).get('x-session-id', 'default_session')
        
        if session_id not in agent_instances:
            print(f"Creating new agent instance for session {session_id}")
            # Check for API key in environment variables
            openai_api_key = os.environ.get('OPENAI_API_KEY')
            if not openai_api_key:
                print("Warning: OPENAI_API_KEY environment variable not found")
                
            agent_instances[session_id] = LangGraphSurveyAgent(api_key=openai_api_key)
        
        agent = agent_instances[session_id]
        
        # Handle different operations based on path and method
        if path.endswith('/start') and method == 'POST':
            # Start conversation
            return handle_start(agent)
        
        elif path.endswith('/process') and method == 'POST':
            # Process user response
            return handle_process(agent, event)
        
        elif path.endswith('/survey') and method == 'GET':
            # Get generated survey questions
            return handle_survey(agent)
        
        # Default test endpoint
        elif path.endswith('/test') and method == 'GET':
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Survey API is working!'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
            
        # Default 404 response
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Not found', 'path': path, 'method': method}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
        
    except Exception as e:
        print(f"Unhandled error: {e}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Server error: {str(e)}"}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

# Handle start conversation request
def handle_start(agent):
    """Handle start conversation request"""
    try:
        first_question = agent.start_conversation()
        return {
            'statusCode': 200,
            'body': json.dumps({'question': first_question}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        print(f"Error starting conversation: {e}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Failed to start conversation: {str(e)}"}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

# Handle user response
def handle_process(agent, event):
    """Handle user response request"""
    try:
        body_str = event.get('body', '{}')
        print(f"Received request body: {body_str}")
        
        # Parse request body
        body = json.loads(body_str) if isinstance(body_str, str) else body_str
        user_response = body.get('userResponse', '')
        
        if not user_response:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': "Missing userResponse parameter"}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        
        # Process response
        next_question, is_complete = agent.process_response(user_response)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'question': next_question,
                'isComplete': is_complete
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        print(f"Error processing response: {e}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Failed to process response: {str(e)}"}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

# Get generated survey
def handle_survey(agent):
    """Handle get survey request"""
    try:
        survey_questions = agent.generate_survey_questions()
        
        # Ensure each question has a unique ID
        for i, question in enumerate(survey_questions):
            if 'id' not in question:
                question['id'] = f"q_{i+1}"
        
        return {
            'statusCode': 200,
            'body': json.dumps({'questions': survey_questions}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        print(f"Error getting survey: {e}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Failed to get survey: {str(e)}"}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }