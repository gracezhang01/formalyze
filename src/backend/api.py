from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import traceback
from langgraph_survey_agent import LangGraphSurveyAgent

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 创建一个全局的 agent 实例
survey_agent = None

@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({"message": "API is working!"})

@app.route('/api/survey-agent/start', methods=['POST'])
def start_conversation():
    try:
        global survey_agent
        survey_agent = LangGraphSurveyAgent()
        # 开始对话
        first_question = survey_agent.start_conversation()
        return jsonify({"question": first_question})
    except Exception as e:
        print(f"Error in start_conversation: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/survey-agent/process', methods=['POST'])
def process_response():
    try:
        global survey_agent
        if not survey_agent:
            return jsonify({"error": "Conversation not started"}), 400
        
        data = request.json
        user_response = data.get('userResponse', '')
        
        # 处理用户响应
        next_question, is_complete = survey_agent.process_response(user_response)
        
        return jsonify({
            "question": next_question,
            "isComplete": is_complete
        })
    except Exception as e:
        print(f"Error in process_response: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/survey-agent/survey', methods=['GET'])
def get_survey():
    try:
        global survey_agent
        if not survey_agent:
            return jsonify({"error": "Conversation not started"}), 400
        
        # 生成调查问题
        questions = survey_agent.generate_survey_questions()
        
        # 确保每个问题都有一个唯一ID
        for i, q in enumerate(questions):
            if 'id' not in q:
                q['id'] = f"q_{i}"
        
        return jsonify({"questions": questions})
    except Exception as e:
        print(f"Error in get_survey: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/survey-agent/finalize', methods=['POST'])
def finalize_survey():
    try:
        data = request.json
        selected_questions = data.get('selectedQuestions', [])
        # 这里可以添加保存调查到数据库的逻辑
        return jsonify({"success": True, "message": "Survey finalized successfully"})
    except (ValueError, KeyError, TypeError) as e:
        print(f"Error in finalize_survey: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        print(f"Runtime error in finalize_survey: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server on port 8080...")
    app.run(debug=True, host='0.0.0.0', port=8080) 