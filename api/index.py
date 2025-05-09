import json
import os
import sys

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Global variable to store survey agent instance
survey_agent = None

def handle_survey_start():
    """Handle the survey start endpoint"""
    try:
        from src.backend.langgraph_survey_agent import LangGraphSurveyAgent
        
        # Initialize agent with OpenAI API key
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable not found")
            
        agent = LangGraphSurveyAgent(api_key=openai_api_key)
        first_question = agent.start_conversation()
        
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
        print(f"Error in handle_survey_start: {str(e)}")
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
        # Extract request information
        method = request.get('httpMethod', 'GET')
        path = request.get('path', '')
        
        print(f"Handling request: {method} {path}")
        
        # Handle CORS preflight
        if method == 'OPTIONS':
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
            return handle_survey_start()
            
        # Test endpoint
        if path == '/api/test':
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
        print(f"Error in handler: {str(e)}")
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