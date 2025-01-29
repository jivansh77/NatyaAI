from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

HF_TOKEN = os.getenv('HUGGINGFACE_API_KEY')
if not HF_TOKEN:
    raise ValueError("HF_TOKEN not found in environment variables")

MODEL_ID = "HuggingFaceH4/zephyr-7b-beta"
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

def generate_dance_advice(prompt):
    try:
        # Modified prompt format to handle both dance and cultural queries
        formatted_prompt = f"""<human>Please provide information about: {prompt}. If this is a dance-related query, focus on classical dances like Bharatanatyam, Kathak, Odissi, or folk dances. If it's about a place or cultural topic, provide relevant cultural and historical information. Keep the response informative but concise.</human>

<assistant>Here's what you should know:</assistant>"""
        
        # Add retry mechanism
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    API_URL,
                    headers=headers,
                    json={
                        "inputs": formatted_prompt,
                        "parameters": {
                            "max_new_tokens": 200,  # Increased for more detailed responses
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "do_sample": True,
                            "return_full_text": False
                        }
                    },
                    timeout=30  # Add timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        text = result[0].get('generated_text', '')
                        if text:
                            # Clean up response
                            text = text.split('***')[0].strip()
                            return text
                    
                # Model might be loading
                elif response.status_code == 503:
                    if attempt < max_retries - 1:  # Don't sleep on last attempt
                        time.sleep(5)  # Wait before retrying
                    continue
                        
                print(f"Attempt {attempt + 1} failed. Status: {response.status_code}")
                print(f"Response: {response.text}")
                
            except requests.exceptions.RequestException as e:
                print(f"Request error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                continue
                
        return "I apologize, but I'm having trouble accessing the dance information right now. Please try again in a moment."
            
    except Exception as e:
        print(f"Error in generate_dance_advice: {str(e)}")
        return "I apologize, but I'm having trouble processing your request right now."

@app.route('/api/dance-advice', methods=['POST'])
def get_dance_advice():
    try:
        data = request.json
        user_prompt = data.get('prompt', '')
        
        if not user_prompt:
            return jsonify({'error': 'Prompt is required'}), 400
            
        advice = generate_dance_advice(user_prompt)
        return jsonify({'response': advice})
        
    except Exception as e:
        print(f"Error in get_dance_advice: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=1024)   
    