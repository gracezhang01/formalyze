import json

def handler(request):
    """
    Simple request handler for Vercel serverless functions
    """
    try:
        # Extract request information
        method = request.get('httpMethod', 'GET')  # Vercel uses httpMethod, not method
        path = request.get('path', '')
        
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
                'path': path
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
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