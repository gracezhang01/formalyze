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
print("======================")

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Global variable to store survey agent instance
survey_agent = None

def handle(request):
    """Handle incoming HTTP requests"""
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Request path: {request.path}")
    
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    # Handle OPTIONS request for CORS
    if request.method == "OPTIONS":
        return {
            "statusCode": HTTPStatus.OK,
            "headers": headers,
            "body": ""
        }

    try:
        # Test endpoint
        if request.path == "/api/test":
            return {
                "statusCode": HTTPStatus.OK,
                "headers": headers,
                "body": json.dumps({"message": "API is working!"})
            }

        # Handle survey start endpoint
        if request.path == '/api/survey-agent/start' and request.method == 'POST':
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
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            except Exception as e:
                print(f"Error in survey start: {str(e)}")
                traceback.print_exc()
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': str(e)}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }

        # Invalid path
        return {
            "statusCode": HTTPStatus.NOT_FOUND,
            "headers": headers,
            "body": json.dumps({"error": "Invalid endpoint"})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "headers": headers,
            "body": json.dumps({
                "error": "Internal server error",
                "details": str(e)
            })
        }