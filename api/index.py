from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import traceback

# Add project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Global variable to store survey_agent instance
survey_agent = None

def handler(request):
    try:
        # Get request path and method
        path = request.get("path", "")
        method = request.get("httpMethod", "GET")  # Vercel uses httpMethod
        
        # Test API endpoint
        if path == "/api/test":
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'API is working!'}),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
        
        # Start conversation
        elif path == "/api/survey-agent/start" and method == "POST":
            # Import necessary classes
            from src.backend.langgraph_survey_agent import LangGraphSurveyAgent
            
            # Initialize agent
            survey_agent = LangGraphSurveyAgent()
            
            # Start conversation
            first_question = survey_agent.start_conversation()
            
            return {
                "statusCode": 200,
                "body": {"question": first_question},
                "headers": {"Content-Type": "application/json"}
            }
        
        # Process user response
        elif path == "/api/survey-agent/process" and method == "POST":
            if not survey_agent:
                return {
                    "statusCode": 400,
                    "body": {"error": "Conversation not started"},
                    "headers": {"Content-Type": "application/json"}
                }
            
            # Get request body
            body = json.loads(request.get("body", "{}"))
            user_response = body.get("userResponse", "")
            
            # Process user response
            next_question, is_complete = survey_agent.process_response(user_response)
            
            return {
                "statusCode": 200,
                "body": {
                    "question": next_question,
                    "isComplete": is_complete
                },
                "headers": {"Content-Type": "application/json"}
            }
        
        # Get survey questions
        elif path == "/api/survey-agent/survey" and method == "GET":
            if not survey_agent:
                return {
                    "statusCode": 400,
                    "body": {"error": "Conversation not started"},
                    "headers": {"Content-Type": "application/json"}
                }
            
            # Generate survey questions
            questions = survey_agent.generate_survey_questions()
            
            # Ensure each question has a unique ID
            for i, q in enumerate(questions):
                if "id" not in q:
                    q["id"] = f"q_{i}"
            
            return {
                "statusCode": 200,
                "body": {"questions": questions},
                "headers": {"Content-Type": "application/json"}
            }
        
        # Finalize survey
        elif path == "/api/survey-agent/finalize" and method == "POST":
            # Get request body
            body = json.loads(request.get("body", "{}"))
            selected_questions = body.get("selectedQuestions", [])
            
            # Here you can add logic to save survey to database
            
            return {
                "statusCode": 200,
                "body": {
                    "success": True,
                    "message": "Survey finalized successfully"
                },
                "headers": {"Content-Type": "application/json"}
            }
        
        # Default return 404
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Not found', 'path': path, 'method': method}),
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    
    except Exception as e:
        # Print error information
        print(f"Error: {str(e)}")
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json'
            }
        }
