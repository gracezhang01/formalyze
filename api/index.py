import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.backend.api import app

def handler(request, response):
    return {
        "statusCode": 200,
        "body": {"message": "API is running"},
        "headers": {
            "Content-Type": "application/json"
        }
    }
