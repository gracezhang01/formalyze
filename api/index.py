import sys
import os
import json
import traceback

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 全局变量存储survey_agent实例
survey_agent = None

def handler(request, response):
    global survey_agent
    
    try:
        # 获取请求路径和方法
        path = request.get("path", "")
        method = request.get("method", "GET")
        
        # 测试API端点
        if path == "/api/test":
           return {
            'statusCode': 200,
            'body': {'message': 'API is working!'},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
        
        # 开始对话
        elif path == "/api/survey-agent/start" and method == "POST":
            # 导入必要的类
            from src.backend.langgraph_survey_agent import LangGraphSurveyAgent
            
            # 初始化agent
            survey_agent = LangGraphSurveyAgent()
            
            # 开始对话
            first_question = survey_agent.start_conversation()
            
            return {
                "statusCode": 200,
                "body": {"question": first_question},
                "headers": {"Content-Type": "application/json"}
            }
        
        # 处理用户响应
        elif path == "/api/survey-agent/process" and method == "POST":
            if not survey_agent:
                return {
                    "statusCode": 400,
                    "body": {"error": "Conversation not started"},
                    "headers": {"Content-Type": "application/json"}
                }
            
            # 获取请求体
            body = json.loads(request.get("body", "{}"))
            user_response = body.get("userResponse", "")
            
            # 处理用户响应
            next_question, is_complete = survey_agent.process_response(user_response)
            
            return {
                "statusCode": 200,
                "body": {
                    "question": next_question,
                    "isComplete": is_complete
                },
                "headers": {"Content-Type": "application/json"}
            }
        
        # 获取调查问题
        elif path == "/api/survey-agent/survey" and method == "GET":
            if not survey_agent:
                return {
                    "statusCode": 400,
                    "body": {"error": "Conversation not started"},
                    "headers": {"Content-Type": "application/json"}
                }
            
            # 生成调查问题
            questions = survey_agent.generate_survey_questions()
            
            # 确保每个问题都有一个唯一ID
            for i, q in enumerate(questions):
                if "id" not in q:
                    q["id"] = f"q_{i}"
            
            return {
                "statusCode": 200,
                "body": {"questions": questions},
                "headers": {"Content-Type": "application/json"}
            }
        
        # 完成调查
        elif path == "/api/survey-agent/finalize" and method == "POST":
            # 获取请求体
            body = json.loads(request.get("body", "{}"))
            selected_questions = body.get("selectedQuestions", [])
            
            # 这里可以添加保存调查到数据库的逻辑
            
            return {
                "statusCode": 200,
                "body": {
                    "success": True,
                    "message": "Survey finalized successfully"
                },
                "headers": {"Content-Type": "application/json"}
            }
        
        # 默认返回404
        else:
            return {
                "statusCode": 404,
                "body": {"error": "Not found"},
                "headers": {"Content-Type": "application/json"}
            }
    
    except Exception as e:
        # 打印错误信息
        print(f"Error: {e}")
        traceback.print_exc()
        
        return {
            "statusCode": 500,
            "body": {"error": str(e)},
            "headers": {"Content-Type": "application/json"}
        }
