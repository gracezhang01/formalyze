from http.server import BaseHTTPRequestHandler
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

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self._handle_request('GET')

    def do_POST(self):
        self._handle_request('POST')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _handle_request(self, method):
        try:
            print(f"Handling {method} request to {self.path}")
            
            # Test endpoint
            if self.path == '/api/test':
                self._send_json_response(200, {'message': 'Hello from Python on Vercel!'})
                return

            # Default 404 response
            self._send_json_response(404, {
                'error': 'Not Found',
                'path': self.path,
                'method': method
            })

        except Exception as e:
            print("=== Handler Error ===")
            print(f"Error Type: {type(e)}")
            print(f"Error Message: {str(e)}")
            traceback.print_exc()
            print("===================")
            self._send_json_response(500, {'error': str(e)})

    def _send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def handler(request, response):
    return Handler(request, response)

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