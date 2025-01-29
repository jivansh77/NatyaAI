from flask import Flask, Response
from flask_cors import CORS
import subprocess
import os
import sys
import warnings

# Suppress urllib3 warning
warnings.filterwarnings('ignore', category=Warning)

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    try:
        # Set environment variables for camera and Tk
        env = os.environ.copy()
        env['TK_SILENCE_DEPRECATION'] = '1'
        
        # Start the Tkinter application in a separate process using the current Python interpreter
        script_dir = os.path.dirname(os.path.abspath(__file__))
        tkinter_script = os.path.join(script_dir, 'testy.py')
        subprocess.Popen([sys.executable, tkinter_script], env=env)
        
        return """
        <html>
            <head>
                <title>Bharatanatyam Pose Detection</title>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                </style>
            </head>
            <body>
                <div id="tkinter-app">
                    <p>Loading Pose Detection Application...</p>
                </div>
            </body>
        </html>
        """
    except Exception as e:
        return f"""
        <html>
            <head>
                <title>Error</title>
            </head>
            <body>
                <h1>Error Starting Application</h1>
                <p>Error: {str(e)}</p>
                <p>Script path: {tkinter_script}</p>
                <p>Python path: {sys.executable}</p>
            </body>
        </html>
        """

if __name__ == '__main__':
    app.run(port=5010, debug=True) 