from http.server import BaseHTTPRequestHandler

def handler(request):
    return {
        "statusCode": 200,
        "body": {"message": "API is working!"},
        "headers": {
            "Content-Type": "application/json"
        }
    }