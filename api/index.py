import json
import os
import sys
import traceback
from http import HTTPStatus
from typing import Dict, Any

# Add debug logging
print("=== Debug Information ===")
print("Python Version:", sys.version)
print("Current Directory:", os.getcwd())
print("Directory Contents:", os.listdir())
print("Python Path:", sys.path)
print("Environment Variables:", {k: v for k, v in os.environ.items() if not k.startswith('AWS_')})
print("=== Module Information ===")
print("Current module:", __name__)
print("Module dict:", globals().keys())
print("======================")

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Global variable to store survey agent instance
survey_agent = None

def handler(request):
    """
    Main handler function for Vercel serverless deployment
    This must be named 'handler' for Vercel to find it
    """
    print("=== Request Debug ===")
    print("Handler called with request type:", type(request))
    print("Request attributes:", dir(request))
    print("Request dict:", vars(request) if hasattr(request, '__dict__') else "No __dict__")
    
    try:
        # Try to access common request attributes
        method = getattr(request, 'method', None)
        headers = getattr(request, 'headers', {})
        path = getattr(request, 'path', None)
        
        print(f"Extracted method: {method}")
        print(f"Extracted headers: {headers}")
        print(f"Extracted path: {path}")
        
        # Set CORS headers
        response_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        }
        
        # Handle OPTIONS request for CORS
        if method == "OPTIONS":
            print("Handling OPTIONS request")
            return {
                "statusCode": HTTPStatus.OK,
                "headers": response_headers,
                "body": ""
            }

        # Test endpoint
        if path == "/api/test":
            print("Handling test endpoint")
            return {
                "statusCode": HTTPStatus.OK,
                "headers": response_headers,
                "body": json.dumps({"message": "API is working!"})
            }

        # Handle survey start endpoint
        if path == '/api/survey-agent/start' and method == 'POST':
            print("Handling survey start endpoint")
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
                    'body': json.dumps({'question': first_question}),
                    'headers': response_headers
                }
            except Exception as e:
                print(f"Error in survey start: {str(e)}")
                print(f"Survey start traceback: {traceback.format_exc()}")
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': str(e)}),
                    'headers': response_headers
                }

        # Invalid path
        print(f"Invalid path requested: {path}")
        return {
            "statusCode": HTTPStatus.NOT_FOUND,
            "headers": response_headers,
            "body": json.dumps({"error": "Invalid endpoint", "requested_path": path})
        }

    except Exception as e:
        print("=== Handler Error ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "headers": response_headers,
            "body": json.dumps({
                "error": "Internal server error",
                "details": str(e),
                "type": str(type(e))
            })
        }