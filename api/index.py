import json
import os
import sys
import traceback
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any
from io import BytesIO

# Add debug logging
print("=== Debug Information ===")
print("Python Version:", sys.version)
print("Current Directory:", os.getcwd())
print("Directory Contents:", os.listdir())
print("Python Path:", sys.path)
print("Environment Variables:", {k: v for k, v in os.environ.items() if not k.startswith(('AWS_', 'OPENAI_'))})
print("=== Module Information ===")
print("Current module:", __name__)
print("Module dict:", globals().keys())
print("======================")

# Add project root to Python path haha 
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    """
    Handler class for Vercel serverless deployment.
    Must inherit from BaseHTTPRequestHandler as required by Vercel.
    """
    def __init__(self, *args, **kwargs):
        print("=== Handler Initialization ===")
        print("Args:", args)
        print("Kwargs:", {k: v for k, v in kwargs.items() if not k.startswith(('AWS_', 'OPENAI_'))})
        super().__init__(*args, **kwargs)
    
    def log_request_info(self):
        """Log detailed request information"""
        print("\n=== Request Information ===")
        print(f"Path: {self.path}")
        print(f"Command: {self.command}")
        print(f"Request version: {self.request_version}")
        print(f"Headers: {dict(self.headers)}")
        print("========================\n")

    def _send_response(self, status_code: int, body: Dict[str, Any], headers: Dict[str, str] = None):
        """Helper method to send responses with logging"""
        print(f"\n=== Sending Response ===")
        print(f"Status Code: {status_code}")
        print(f"Headers: {headers}")
        print(f"Body: {body}")
        print("=====================\n")

        if headers is None:
            headers = {}
            
        # Default CORS headers
        default_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        }
        
        # Merge default headers with provided headers
        headers = {**default_headers, **headers}
        
        try:
            # Send response
            self.send_response(status_code)
            for key, value in headers.items():
                self.send_header(key, value)
            self.end_headers()
            
            # Send body if present
            if body:
                response = json.dumps(body).encode('utf-8')
                self.wfile.write(response)
        except Exception as e:
            print(f"Error sending response: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.log_request_info()
        print("Handling OPTIONS request")
        self._send_response(HTTPStatus.OK, {})

    def do_GET(self):
        """Handle GET requests"""
        self.log_request_info()
        try:
            if self.path == "/api/test":
                print("Handling test endpoint")
                self._send_response(
                    HTTPStatus.OK,
                    {"message": "API is working!"}
                )
            else:
                print(f"Invalid path requested: {self.path}")
                self._send_response(
                    HTTPStatus.NOT_FOUND,
                    {"error": "Invalid endpoint", "requested_path": self.path}
                )
        except Exception as e:
            print("=== Handler Error ===")
            print(f"Error type: {type(e)}")
            print(f"Error message: {str(e)}")
            print(f"Full traceback: {traceback.format_exc()}")
            self._send_response(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {
                    "error": "Internal server error",
                    "details": str(e),
                    "type": str(type(e))
                }
            )

    def do_POST(self):
        """Handle POST requests"""
        self.log_request_info()
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length else b'{}'
            print(f"Request body: {body.decode('utf-8')}")

            if self.path == '/api/survey-agent/start':
                print("Handling survey start endpoint")
                try:
                    from src.backend.langgraph_survey_agent import LangGraphSurveyAgent
                    
                    # Initialize agent with OpenAI API key
                    openai_api_key = os.environ.get('OPENAI_API_KEY')
                    if not openai_api_key:
                        raise ValueError("OPENAI_API_KEY environment variable not found")
                        
                    agent = LangGraphSurveyAgent(api_key=openai_api_key)
                    first_question = agent.start_conversation()
                    
                    self._send_response(
                        HTTPStatus.OK,
                        {'question': first_question}
                    )
                except Exception as e:
                    print(f"Error in survey start: {str(e)}")
                    print(f"Survey start traceback: {traceback.format_exc()}")
                    self._send_response(
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        {'error': str(e)}
                    )
            elif self.path == "/api/survey-agent/generate" and self.command == "POST":
                try:
                    # 解析请求体
                    body = json.loads(self.rfile.read(int(self.headers['Content-Length'])).decode('utf-8'))
                    
                    # 导入必要的类
                    from src.backend.langgraph_survey_agent import LangGraphSurveyAgent
                    
                    # 初始化agent
                    agent = LangGraphSurveyAgent()
                    
                    # 准备提示词
                    prompt = f"""
                    Generate a professional survey based on the following requirements:
                    
                    Purpose: {body.get('purpose', '')}
                    Target audience: {body.get('target_audience', '')}
                    Important feedback: {body.get('important_feedback', '')}
                    Topics to cover: {body.get('topics', '')}
                    Question types: {body.get('question_types', '')}
                    
                    Please generate appropriate survey questions.
                    """
                    
                    # 生成问题
                    questions = agent.generate_survey(prompt)
                    
                    self._send_response(
                        HTTPStatus.OK,
                        {"questions": questions},
                        {"Content-Type": "application/json"}
                    )
                except Exception as e:
                    print(f"Error generating survey questions: {e}")
                    self._send_response(
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        {"error": str(e)},
                        {"Content-Type": "application/json"}
                    )
            else:
                print(f"Invalid path requested: {self.path}")
                self._send_response(
                    HTTPStatus.NOT_FOUND,
                    {"error": "Invalid endpoint", "requested_path": self.path}
                )
        except Exception as e:
            print("=== Handler Error ===")
            print(f"Error type: {type(e)}")
            print(f"Error message: {str(e)}")
            print(f"Full traceback: {traceback.format_exc()}")
            self._send_response(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {
                    "error": "Internal server error",
                    "details": str(e),
                    "type": str(type(e))
                }
            )