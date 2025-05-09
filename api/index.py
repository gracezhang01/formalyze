import json
import os
import sys
import traceback

# Add debug information
print("Current directory:", os.getcwd())
print("Files in current directory:", os.listdir("."))
print("Python path:", sys.path)

def handler(request):
    """Vercel Serverless function handler"""
    try:
        # Get request data
        if isinstance(request, dict):
            path = request.get('path', '')
            method = request.get('httpMethod', 'GET')
        else:
            # Handle the case where request might be a different type
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid request format'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        
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
        
        # Add your other API endpoints here
        # These will be called for all paths that don't start with /api/survey-agent
        
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