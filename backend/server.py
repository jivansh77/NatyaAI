from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
import re

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes with proper configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],  # Frontend URL
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

def clean_json_response(text):
    # Remove any text before the first '{'
    start_idx = text.find('{')
    if start_idx == -1:
        return None
    text = text[start_idx:]
    
    # Find the last '}' and remove anything after it
    end_idx = text.rfind('}')
    if end_idx == -1:
        return None
    text = text[:end_idx + 1]
    
    # Remove any markdown code block syntax
    text = re.sub(r'```\w*\n?', '', text)
    
    return text.strip()

@app.route('/generate-roadmap', methods=['POST', 'OPTIONS'])
def generate_roadmap():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        completed_mudras = data.get('completedMudras', 0)
        completed_dances = data.get('completedDances', 0)
        completed_poses = data.get('completedPoses', 0)
        total_score = data.get('totalScore', 0)

        # Create prompt for Gemini
        prompt = f"""
        Create a JSON object representing a Bharatanatyam learning roadmap based on:
        - Completed Mudras: {completed_mudras}
        - Completed Dance Performances: {completed_dances}
        - Completed Poses: {completed_poses}
        - Total Guru Score: {total_score}

        Return ONLY a valid JSON object with this exact structure, no additional text or formatting:
        {{
            "nodes": [
                {{
                    "id": "node1",
                    "title": "Basic Mudras",
                    "description": "Foundation hand gestures",
                    "recommendations": [
                        "Practice daily for 30 minutes",
                        "Focus on finger flexibility",
                        "Master basic positions"
                    ],
                    "isCompleted": false,
                    "practiceLink": "/mudra-practice",
                    "timeRequired": "30",
                    "currentProgress": 45,
                    "projectedStats": {{
                        "mudras": 5,
                        "dances": 2,
                        "poses": 3,
                        "score": 100
                    }}
                }}
            ],
            "paths": [
                {{
                    "start": [-2, 0, 0],
                    "end": [0, 1, 0],
                    "isCompleted": false
                }}
            ]
        }}

        Create exactly 6 nodes showing progression through Bharatanatyam skills.
        Mark nodes as completed based on comparing their projectedStats with the user's current progress.
        Include realistic timeRequired values in days (e.g., "30", "60", "90").
        For each node, calculate currentProgress based on the user's completed items vs the node's requirements.
        Include projectedStats showing how many new mudras, dances, poses, and score points will be gained.
        Make sure the progression is logical and builds upon previous nodes.
        Base completion status on whether the user has achieved the projected stats for that node.
        """

        try:
            response = model.generate_content(prompt)
            response_text = response.text
            
            # Clean up the response text
            cleaned_json = clean_json_response(response_text)
            if not cleaned_json:
                print(f"Failed to clean JSON response: {response_text}")
                return jsonify({
                    "success": False,
                    "error": "Invalid response format from AI"
                }), 500
            
            # Parse the JSON response
            try:
                roadmap_data = json.loads(cleaned_json)
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}")
                print(f"Cleaned response text: {cleaned_json}")
                return jsonify({
                    "success": False,
                    "error": "Invalid JSON response from AI"
                }), 500

            # Validate the structure
            if not isinstance(roadmap_data, dict) or 'nodes' not in roadmap_data or 'paths' not in roadmap_data:
                return jsonify({
                    "success": False,
                    "error": "Invalid roadmap structure"
                }), 500

            return jsonify({
                "success": True,
                "roadmap": roadmap_data
            })

        except Exception as e:
            print(f"Error generating content: {str(e)}")
            return jsonify({
                "success": False,
                "error": "Failed to generate content"
            }), 500

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5005))
    app.run(debug=True, port=port) 