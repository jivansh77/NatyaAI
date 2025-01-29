from flask import Flask, Response, jsonify, request
import cv2
import supervision as sv
from ultralytics import YOLO
import os
import json
from flask_cors import CORS
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from React development server
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load the model
weights_path = os.path.join(os.getcwd(), "src", "mudra", "weights", "best.pt")
logger.info(f"Loading model from: {weights_path}")
logger.info(f"File exists: {os.path.exists(weights_path)}")

try:
    model = YOLO(weights_path)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    raise

# Initialize annotators
box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator()

@app.route('/get_detections', methods=['GET', 'OPTIONS'])
def get_detections():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"})
        
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        logger.error("Failed to capture frame from camera")
        return jsonify({"error": "Failed to capture frame"})
    
    try:
        # Make prediction
        results = model(frame)[0]
        logger.info(f"Model classes: {results.names}")
        
        # Convert predictions to supervision Detections
        detections = sv.Detections.from_ultralytics(results)
        
        # Get labels and confidence scores
        detected_mudras = [
            {
                "label": results.names[class_id],
                "confidence": float(confidence)
            }
            for class_id, confidence in zip(detections.class_id, detections.confidence)
        ]
        
        logger.info(f"Detected mudras: {detected_mudras}")
        return jsonify({"detections": detected_mudras})
    except Exception as e:
        logger.error(f"Error during detection: {str(e)}")
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(port=5000, debug=True) 