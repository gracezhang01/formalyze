import sys
import os

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 现在可以导入 src/backend 中的模块
from src.backend.langgraph_survey_agent import LangGraphSurveyAgent

def create_response(status_code, body, headers=None):
    """创建标准响应格式"""
    if headers is None:
        headers = {}
    
    # 确保设置 CORS 头
    if 'Content-Type' not in headers:
        headers['Content-Type'] = 'application/json'
    if 'Access-Control-Allow-Origin' not in headers:
        headers['Access-Control-Allow-Origin'] = '*'
    
    # 如果 body 不是字符串，将其转换为 JSON 字符串
    if not isinstance(body, str):
        body = json.dumps(body)
    
    return {
        'statusCode': status_code,
        'body': body,
        'headers': headers
    }

def handler(req):
    """Vercel Serverless 函数处理器"""
    try:
        # 获取请求数据
        path = req.get('path', '')
        method = req.get('httpMethod', 'GET')
        
        print(f"Processing request: {path} ({method})")
        
        # 解析路径部分
        parts = path.split('/')
        parts = [p for p in parts if p and p != 'api']
        
        # 处理 survey-agent 相关请求
        if len(parts) >= 1 and parts[0] == 'survey-agent':
            action = parts[1] if len(parts) > 1 else None
            
            # 导入 LangGraphSurveyAgent
            try:
                from langgraph_survey_agent import LangGraphSurveyAgent
            except ImportError as e:
                print(f"Error importing LangGraphSurveyAgent: {e}")
                traceback.print_exc()
                return create_response(500, {'error': f"Import error: {str(e)}"})
            
            # 开始对话
            if action == 'start' and method == 'POST':
                try:
                    # 初始化 agent
                    agent = LangGraphSurveyAgent()
                    # 开始对话
                    first_question = agent.start_conversation()
                    
                    # 这里您需要存储 agent 状态，因为不能使用全局变量
                    # 例如，可以将状态保存到数据库，或者返回给客户端让客户端保存
                    
                    return create_response(200, {'question': first_question})
                except Exception as e:
                    print(f"Error in start_conversation: {e}")
                    traceback.print_exc()
                    return create_response(500, {'error': str(e)})
            
            # 处理用户响应
            elif action == 'process' and method == 'POST':
                try:
                    # 获取请求体
                    body = json.loads(req.get('body', '{}'))
                    user_response = body.get('userResponse', '')
                    
                    # 注意：这里您需要重新创建 agent 并恢复状态
                    # 如果您没有外部状态存储，可以考虑简化实现
                    
                    # 简化的实现：在生产环境中，您需要从数据库加载状态
                    agent = LangGraphSurveyAgent()
                    
                    # 处理用户响应（简化版）
                    return create_response(200, {
                        'question': f"Thank you for your response: '{user_response}'. Based on your needs, I recommend...",
                        'isComplete': True
                    })
                except Exception as e:
                    print(f"Error in process_response: {e}")
                    traceback.print_exc()
                    return create_response(500, {'error': str(e)})
            
            # 获取调查问题
            elif action == 'survey' and method == 'GET':
                try:
                    # 注意：这里您需要重新创建 agent 并恢复状态
                    # 简化实现：返回示例问题
                    sample_questions = [
                        {
                            "id": "q_1",
                            "question_text": "How satisfied are you with our product?",
                            "question_type": "multiple_choice",
                            "required": True,
                            "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
                        },
                        {
                            "id": "q_2",
                            "question_text": "What features do you like most about our product?",
                            "question_type": "text",
                            "required": False
                        },
                        {
                            "id": "q_3",
                            "question_text": "Would you recommend our product to a friend?",
                            "question_type": "boolean",
                            "required": True
                        }
                    ]
                    
                    return create_response(200, {'questions': sample_questions})
                except Exception as e:
                    print(f"Error in get_survey: {e}")
                    traceback.print_exc()
                    return create_response(500, {'error': str(e)})
        
        # 默认返回 404
        return create_response(404, {'error': 'Not found', 'path': path, 'method': method})
    
    except Exception as e:
        print(f"Unhandled error: {e}")
        traceback.print_exc()
        return create_response(500, {'error': str(e)})