import json
import os
import sys
import traceback

# Add debug information
print("Current directory:", os.getcwd())
print("Files in current directory:", os.listdir("."))
print("Python path:", sys.path)

def handler(req):
    """Vercel Serverless function handler"""
    try:
        # Get request data
        path = req.get('path', '')
        method = req.get('httpMethod', 'GET')
        
        print(f"Processing request: {path} ({method})")
        
        # Test API endpoint - verify basic functionality
        if path == "/api/test":
            print("Processing /api/test endpoint")
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'API is working!'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        
        # Parse path components
        parts = path.split('/')
        parts = [p for p in parts if p and p != 'api']
        
        # Handle survey-agent related requests
        if len(parts) >= 1 and parts[0] == 'survey-agent':
            action = parts[1] if len(parts) > 1 else None
            
            # Start conversation
            if action == 'start' and method == 'POST':
                print("Processing /api/survey-agent/start endpoint")
                
                # Return mock response
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'question': 'This is a sample question. Please share your survey requirements, such as target audience, topic, and the type of information you want to collect.'
                    }),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            
            # Process user response
            elif action == 'process' and method == 'POST':
                print("Processing /api/survey-agent/process endpoint")
                
                # Get request body
                try:
                    body_str = req.get('body', '{}')
                    print(f"Received request body: {body_str}")
                    body = json.loads(body_str)
                    user_response = body.get('userResponse', '')
                    
                    # Simplified response
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'question': f"Thank you for your response: '{user_response}'. Based on your requirements, I suggest including the following question types...",
                            'isComplete': True
                        }),
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    }
                except Exception as e:
                    print(f"Error processing request body: {e}")
                    traceback.print_exc()
                    return {
                        'statusCode': 500,
                        'body': json.dumps({'error': f"Failed to process request: {str(e)}"}),
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    }
            
            # Get survey questions
            elif action == 'survey' and method == 'GET':
                print("Processing /api/survey-agent/survey endpoint")
                
                # Sample questions
                sample_questions = [
                    {
                        "id": "q_1",
                        "question_text": "How satisfied are you with our product?",
                        "question_type": "multiple_choice",
                        "required": True,
                        "options": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
                    },
                    {
                        "id": "q_2",
                        "question_text": "Which features of our product do you like the most?",
                        "question_type": "text",
                        "required": False
                    },
                    {
                        "id": "q_3",
                        "question_text": "Would you recommend our product to friends?",
                        "question_type": "boolean",
                        "required": True
                    }
                ]
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({'questions': sample_questions}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
        
        # Default return 404
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