import json
import os
import sys
import traceback

# Add debug logging
print("=== Debug Information ===")
print("Python Version:", sys.version)
print("Current Directory:", os.getcwd())
print("Directory Contents:", os.listdir())
print("Python Path:", sys.path)
print("======================")

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Global variable to store survey agent instance
survey_agent = None

def handle_survey_start():
    """Handle the survey start endpoint"""
    try:
        print("Attempting to handle survey start...")
        from src.backend.langgraph_survey_agent import LangGraphSurveyAgent
        print("Successfully imported LangGraphSurveyAgent")
        
        # Initialize agent with OpenAI API key
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        if not openai_api_key:
            print("ERROR: OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY environment variable not found")
            
        print("Found OpenAI API key, initializing agent...")
        agent = LangGraphSurveyAgent(api_key=openai_api_key)
        first_question = agent.start_conversation()
        print("Successfully started conversation")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'question': first_question
            })
        }
    except Exception as e:
        print("=== Survey Start Error ===")
        print(f"Error Type: {type(e)}")
        print(f"Error Message: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        print("========================")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }

def handler(request):
    """
    Vercel serverless function handler
    """
    try:
        print("=== Request Information ===")
        print("Request type:", type(request))
        print("Request content:", request)
        print("=========================")

        # Extract request information
        method = request.get('httpMethod', 'GET')
        path = request.get('path', '')
        
        print(f"Processing request: {method} {path}")
        
        # Handle CORS preflight
        if method == 'OPTIONS':
            print("Handling OPTIONS request")
            return {
                'statusCode': 204,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }
        
        # Survey agent endpoints
        if path == '/api/survey-agent/start' and method == 'POST':
            print("Handling survey agent start request")
            return handle_survey_start()
            
        # Test endpoint
        if path == '/api/test':
            print("Handling test endpoint request")
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Hello from Python on Vercel!'
                })
            }

        # Default 404 response
        print(f"No matching route found for {path}")
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Not Found',
                'path': path,
                'method': method
            })
        }

    except Exception as e:
        print("=== Handler Error ===")
        print(f"Error Type: {type(e)}")
        print(f"Error Message: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        print("===================")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }