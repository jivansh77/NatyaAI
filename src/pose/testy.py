import cv2
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import mediapipe as mp
import numpy as np
from gtts import gTTS
import os
import tempfile
from pygame import mixer  # For playing audio
import threading
import speech_recognition as sr
import re

class BharatanatyamPoseApp:
    def __init__(self, window):
        self.window = window
        self.window.title("Bharatanatyam Pose Detection")
        
        # Set window style
        style = ttk.Style()
        style.configure('TButton', padding=5, font=('Arial', 10))
        style.configure('TLabel', font=('Arial', 10))
        style.configure('Header.TLabel', font=('Arial', 12, 'bold'))

        # Initialize video capture
        self.video_capture = cv2.VideoCapture(0)

        # Initialize Mediapipe
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # Initialize pose references dictionary
        self.all_reference_angles = {
            'Araimandi': {
                'left_knee': 99.2,
                'right_knee': 114.3,
                'back': 137.6,
                'left_thigh': 136.0,
                'right_thigh': 138.5,
                'left_foot': 36.4,
                'right_foot': 25.4,
            },
            'Muzhumandi': {
                'left_knee': 177.7,
                'right_knee': 80.6,
                'back': 178.1,
                'left_thigh': 6.3,
                'right_thigh': 12.4,
                'left_foot': 7.3,
                'right_foot': 15.1,
            },
            'Samapadam': {
                'left_knee': 176.1,
                'right_knee': 176.1,
                'back': 174.3,
                'left_thigh': 177.2,
                'right_thigh': 175.0,
                'left_foot': 10.5,
                'right_foot': 7.3,
            }
        }

        # Add angle tolerances - tighter 5 degree tolerance
        self.angle_tolerances = {
            'left_knee': 5,
            'right_knee': 5,
            'back': 5,
            'left_thigh': 5,
            'right_thigh': 5,
            'left_foot': 5,
            'right_foot': 5
        }

        # Current selected pose
        self.current_pose = 'Araimandi'
        self.reference_angles = self.all_reference_angles[self.current_pose]

        # Create main container with padding
        self.main_container = ttk.Frame(window, padding="10")
        self.main_container.pack(fill=tk.BOTH, expand=True)

        # Create header
        self.header_frame = ttk.Frame(self.main_container)
        self.header_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(
            self.header_frame, 
            text="Bharatanatyam Pose Detection", 
            style='Header.TLabel'
        ).pack(side=tk.LEFT)

        # Create left frame for video with border
        self.video_frame = ttk.Frame(self.main_container, relief="solid", borderwidth=1)
        self.video_frame.pack(side=tk.LEFT, padx=(0, 10))

        # Video display label
        self.video_label = ttk.Label(self.video_frame)
        self.video_label.pack(padx=5, pady=5)

        # Create right frame for controls with better organization
        self.controls_frame = ttk.Frame(self.main_container)
        self.controls_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        # Pose selection section
        self.pose_section = ttk.LabelFrame(self.controls_frame, text="Pose Selection", padding="5")
        self.pose_section.pack(fill=tk.X, pady=(0, 10))

        self.pose_var = tk.StringVar(value='Araimandi')
        self.pose_dropdown = ttk.Combobox(
            self.pose_section,
            textvariable=self.pose_var,
            values=['Araimandi', 'Muzhumandi', 'Samapadam'],
            state='readonly',
            width=30
        )
        self.pose_dropdown.pack(padx=5, pady=5)
        self.pose_dropdown.bind('<<ComboboxSelected>>', self.on_pose_selected)

        # Control buttons section
        self.controls_section = ttk.LabelFrame(self.controls_frame, text="Controls", padding="5")
        self.controls_section.pack(fill=tk.X, pady=(0, 10))

        self.btn_frame = ttk.Frame(self.controls_section)
        self.btn_frame.pack(fill=tk.X, padx=5, pady=5)

        self.start_button = ttk.Button(
            self.btn_frame, 
            text="▶ Start", 
            command=self.start_detection,
            width=15
        )
        self.start_button.pack(side=tk.LEFT, padx=5)

        self.stop_button = ttk.Button(
            self.btn_frame, 
            text="⏹ Stop", 
            command=self.stop_detection,
            width=15
        )
        self.stop_button.pack(side=tk.LEFT, padx=5)

        # Add voice command button to controls section
        self.voice_command_button = ttk.Button(
            self.btn_frame,
            text="🎤 Ask Question",
            command=self.listen_for_question,
            width=15
        )
        self.voice_command_button.pack(side=tk.LEFT, padx=5)

        # Reference controls section
        self.ref_section = ttk.LabelFrame(self.controls_frame, text="Reference Pose", padding="5")
        self.ref_section.pack(fill=tk.X, pady=(0, 10))

        self.ref_frame = ttk.Frame(self.ref_section)
        self.ref_frame.pack(fill=tk.X, padx=5, pady=5)

        self.capture_ref_button = ttk.Button(
            self.ref_frame,
            text="📸 Capture Reference",
            command=self.start_reference_capture,
            width=20
        )
        self.capture_ref_button.pack(side=tk.LEFT, padx=5)

        self.clear_ref_button = ttk.Button(
            self.ref_frame,
            text="🗑 Clear Reference",
            command=self.clear_reference,
            width=20
        )
        self.clear_ref_button.pack(side=tk.LEFT, padx=5)

        # Status section
        self.status_section = ttk.LabelFrame(self.controls_frame, text="Status", padding="5")
        self.status_section.pack(fill=tk.X, pady=(0, 10))

        self.ref_status_label = ttk.Label(
            self.status_section,
            text="Reference Pose: Using Default",
            padding="5"
        )
        self.ref_status_label.pack(fill=tk.X)

        self.status_label = ttk.Label(
            self.status_section,
            text="Status: Stopped",
            padding="5"
        )
        self.status_label.pack(fill=tk.X)

        # Feedback section
        self.feedback_section = ttk.LabelFrame(self.controls_frame, text="Feedback", padding="5")
        self.feedback_section.pack(fill=tk.BOTH, expand=True)

        # Add scrollbar
        self.feedback_scroll = ttk.Scrollbar(self.feedback_section)
        self.feedback_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        # Feedback text widget
        self.feedback_text = tk.Text(
            self.feedback_section,
            font=("Arial", 11),
            wrap=tk.WORD,
            width=40,
            height=15,
            yscrollcommand=self.feedback_scroll.set
        )
        self.feedback_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.feedback_scroll.config(command=self.feedback_text.yview)

        # Make the window resizable
        self.window.resizable(True, True)

        # Set minimum window size
        self.window.minsize(1200, 700)

        self.overall_accuracy = 0

        # Initialize audio mixer
        mixer.init()
        
        # Create a temporary directory for audio files
        self.temp_dir = tempfile.mkdtemp()
        self.is_speaking = False
        
        # Dancer progress tracking
        self.performance_history = []  # Store last 10 accuracy scores
        self.current_level = "Beginner"
        self.last_voice_feedback = ""  # To avoid repetitive feedback
        self.feedback_cooldown = 0  # Cooldown counter for voice feedback
        
        # Add level thresholds
        self.level_thresholds = {
            "Beginner": 75,
            "Intermediate": 85,
            "Advanced": 92,
            "Expert": 97
        }

        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.is_listening = False

        # Dictionary of Bharatanatyam-related QA pairs
        self.qa_database = {
            "what is bharatanatyam": 
                "Bharatanatyam is a classical Indian dance form originating from Tamil Nadu. It is known for its grace, purity, tenderness, and sculpturesque poses.",
            
            "what is araimandi":
                "Araimandi is the basic half-sitting position in Bharatanatyam. Your knees should be bent outward with thighs parallel to the ground.",
            
            "what is muzhumandi":
                "Muzhumandi is the full-sitting position in Bharatanatyam where one leg is bent while the other knee touches the ground.",
            
            "what is samapadam":
                "Samapadam is the equal standing position where feet are placed together and weight is distributed evenly.",
            
            "what are the basic steps":
                "The basic steps in Bharatanatyam include Araimandi, Muzhumandi, Samapadam, and various hand gestures called Mudras.",
            
            "what are mudras":
                "Mudras are hand gestures used in Bharatanatyam to convey specific meanings and emotions. There are 28 single-hand and 23 double-hand mudras.",
            
            "how to improve posture":
                "To improve posture, maintain a straight back, keep your core engaged, and practice holding basic positions for longer durations.",
            
            "what is adavu":
                "Adavu is the basic step in Bharatanatyam. It combines foot movements, hand gestures, and body positions to create rhythmic patterns.",
        }

        # Add pose information database
        self.pose_info_database = {
            'Araimandi': {
                'description': "Araimandi is a fundamental stance in Bharatanatyam where the dancer maintains a half-sitting position. "
                             "The knees are bent outward, and thighs are parallel to the ground, creating a diamond shape. "
                             "This position requires strong leg muscles and proper alignment.",
                'significance': "It's considered the mother of all dance positions in Bharatanatyam, representing readiness and strength.",
                'tips': "Keep your back straight, distribute weight evenly, and ensure knees point outward."
            },
            'Muzhumandi': {
                'description': "Muzhumandi is a full-sitting position where one leg is bent while the other knee touches the ground. "
                             "It's an advanced position that requires flexibility and balance.",
                'significance': "This pose demonstrates the dancer's mastery over body control and ground-level movements.",
                'tips': "Practice with support initially, focus on hip flexibility, and maintain proper spine alignment."
            },
            'Samapadam': {
                'description': "Samapadam is the basic standing position where the feet are placed together. "
                             "It's the starting position for many dance sequences.",
                'significance': "This pose represents balance, symmetry, and the beginning of the dance journey.",
                'tips': "Keep weight evenly distributed, maintain straight posture, and stay relaxed but alert."
            }
        }

        # Add to qa_database
        self.qa_database.update({
            "what pose is this": "CURRENT_POSE_PLACEHOLDER",  # Will be replaced dynamically
            "what position is this": "CURRENT_POSE_PLACEHOLDER",  # Will be replaced dynamically
            "which pose am i doing": "CURRENT_POSE_PLACEHOLDER",  # Will be replaced dynamically
        })

    def start_detection(self):
        self.is_running = True
        self.status_label.config(text="Status: Running")
        self.update_frame()

    def stop_detection(self):
        self.is_running = False
        self.status_label.config(text="Status: Stopped")

    def calculate_angle(self, a, b, c):
        """Calculate the angle between three points."""
        a = np.array(a)  # First point
        b = np.array(b)  # Middle point
        c = np.array(c)  # End point

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)

        if angle > 180.0:
            angle = 360 - angle

        return angle

    def start_reference_capture(self):
        """Start capturing reference pose"""
        self.ref_status_label.config(text="Hold the correct pose and wait 3 seconds...")
        self.window.after(3000, self.capture_reference_pose)

    def on_pose_selected(self, event=None):
        """Handle pose selection change"""
        selected_pose = self.pose_var.get()
        self.current_pose = selected_pose
        
        if self.all_reference_angles[selected_pose]:
            self.reference_angles = self.all_reference_angles[selected_pose]
            self.ref_status_label.config(
                text=f"Reference Pose: Using {selected_pose} reference"
            )
        else:
            self.reference_angles = None
            self.ref_status_label.config(
                text=f"Reference Pose: Not set for {selected_pose}"
            )

    def capture_reference_pose(self):
        """Capture the current pose as reference and log all angles"""
        ret, frame = self.video_capture.read()
        if ret:
            frame = cv2.flip(frame, 1)
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.holistic.process(image)
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                new_reference = {
                    'left_knee': self.calculate_angle(
                        [landmarks[23].x, landmarks[23].y],
                        [landmarks[25].x, landmarks[25].y],
                        [landmarks[27].x, landmarks[27].y]
                    ),
                    'right_knee': self.calculate_angle(
                        [landmarks[24].x, landmarks[24].y],
                        [landmarks[26].x, landmarks[26].y],
                        [landmarks[28].x, landmarks[28].y]
                    ),
                    'back': self.calculate_angle(
                        [landmarks[11].x, landmarks[11].y],
                        [landmarks[23].x, landmarks[23].y],
                        [landmarks[25].x, landmarks[25].y]
                    ),
                    'left_thigh': self.calculate_angle(
                        [landmarks[23].x, landmarks[23].y - 0.2],
                        [landmarks[23].x, landmarks[23].y],
                        [landmarks[25].x, landmarks[25].y]
                    ),
                    'right_thigh': self.calculate_angle(
                        [landmarks[24].x, landmarks[24].y - 0.2],
                        [landmarks[24].x, landmarks[24].y],
                        [landmarks[26].x, landmarks[26].y]
                    ),
                    'left_foot': self.calculate_angle(
                        [landmarks[27].x, landmarks[27].y],
                        [landmarks[31].x, landmarks[31].y],
                        [landmarks[29].x, landmarks[29].y]
                    ),
                    'right_foot': self.calculate_angle(
                        [landmarks[28].x, landmarks[28].y],
                        [landmarks[32].x, landmarks[32].y],
                        [landmarks[30].x, landmarks[30].y]
                    )
                }
                
                # Store the reference angles for the current pose
                self.all_reference_angles[self.current_pose] = new_reference
                self.reference_angles = new_reference
                
                # Log all angles in a formatted way
                print(f"\n=== PERFECT POSE ANGLES FOR {self.current_pose} ===")
                print("Copy the following dictionary to use as reference angles:\n")
                print(f"'{self.current_pose}': {{")
                for angle_name, angle_value in new_reference.items():
                    print(f"    '{angle_name}': {angle_value:.1f},")
                print("}")
                print("\n=========================")
                
                self.ref_status_label.config(
                    text=f"Reference pose captured for {self.current_pose}! Check console for angles."
                )
            else:
                self.ref_status_label.config(
                    text="Failed to detect pose landmarks. Please try again."
                )

    def clear_reference(self):
        """Clear the stored reference pose"""
        self.all_reference_angles[self.current_pose] = {}
        self.reference_angles = None
        self.ref_status_label.config(
            text=f"Reference Pose: Not set for {self.current_pose}"
        )

    def check_bharatanatyam_pose(self, landmarks):
        """Check pose against reference values with improved feedback"""
        if not landmarks:
            return "No pose detected"

        # If no reference angles are set for current pose, show message and return
        if not self.reference_angles:
            self.feedback_text.delete(1.0, tk.END)
            self.feedback_text.tag_configure("bold", font=("Arial", 11, "bold"))
            self.feedback_text.tag_configure("orange", foreground="orange")
            self.feedback_text.insert(tk.END, "Status: ⚠️ NO REFERENCE\n", ("orange", "bold"))
            self.feedback_text.insert(tk.END, f"\nPlease capture a reference pose for {self.current_pose} first.\n")
            self.feedback_text.insert(tk.END, "\nUse the 'Capture Reference Pose' button while demonstrating the correct pose.")
            return "No reference angles set"

        current_angles = {
            'left_knee': self.calculate_angle(
                [landmarks[23].x, landmarks[23].y],
                [landmarks[25].x, landmarks[25].y],
                [landmarks[27].x, landmarks[27].y]
            ),
            'right_knee': self.calculate_angle(
                [landmarks[24].x, landmarks[24].y],
                [landmarks[26].x, landmarks[26].y],
                [landmarks[28].x, landmarks[28].y]
            ),
            'back': self.calculate_angle(
                [landmarks[11].x, landmarks[11].y],
                [landmarks[23].x, landmarks[23].y],
                [landmarks[25].x, landmarks[25].y]
            ),
            'left_thigh': self.calculate_angle(
                [landmarks[23].x, landmarks[23].y - 0.2],
                [landmarks[23].x, landmarks[23].y],
                [landmarks[25].x, landmarks[25].y]
            ),
            'right_thigh': self.calculate_angle(
                [landmarks[24].x, landmarks[24].y - 0.2],
                [landmarks[24].x, landmarks[24].y],
                [landmarks[26].x, landmarks[26].y]
            ),
            'left_foot': self.calculate_angle(
                [landmarks[27].x, landmarks[27].y],
                [landmarks[31].x, landmarks[31].y],
                [landmarks[29].x, landmarks[29].y]
            ),
            'right_foot': self.calculate_angle(
                [landmarks[28].x, landmarks[28].y],
                [landmarks[32].x, landmarks[32].y],
                [landmarks[30].x, landmarks[30].y]
            )
        }

        feedback = []
        accuracy_scores = []

        # Check each angle and provide specific feedback
        for angle_name, current_angle in current_angles.items():
            target_angle = self.reference_angles[angle_name]
            tolerance = self.angle_tolerances[angle_name]
            difference = abs(current_angle - target_angle)
            
            # Calculate accuracy percentage
            accuracy = max(0, 100 - (difference / tolerance) * 100)
            accuracy_scores.append(accuracy)

        # Calculate overall pose accuracy
        self.overall_accuracy = sum(accuracy_scores) / len(accuracy_scores)

        # Update performance history
        self.performance_history.append(self.overall_accuracy)
        if len(self.performance_history) > 10:
            self.performance_history.pop(0)
        
        # Update dancer level based on recent performance
        if len(self.performance_history) >= 5:  # Need at least 5 readings
            avg_performance = sum(self.performance_history) / len(self.performance_history)
            new_level = "Beginner"
            for level, threshold in self.level_thresholds.items():
                if avg_performance >= threshold:
                    new_level = level
            
            if new_level != self.current_level:
                self.current_level = new_level
                self.speak(f"Congratulations! You are now at {new_level} level!")

        # Update current pose status based on accuracy
        if self.overall_accuracy > 85:  # Only set current pose if accuracy is good
            self.current_pose = self.current_pose
        else:
            self.current_pose = None

        # Create feedback message with color tags
        self.feedback_text.delete(1.0, tk.END)
        
        # Configure text colors
        self.feedback_text.tag_configure("green", foreground="green")
        self.feedback_text.tag_configure("red", foreground="red")
        self.feedback_text.tag_configure("orange", foreground="orange")
        self.feedback_text.tag_configure("bold", font=("Arial", 11, "bold"))

        # Add status header
        if self.overall_accuracy > 95:
            self.feedback_text.insert(tk.END, "Status: 🟢 PERFECT!\n", ("green", "bold"))
        elif self.overall_accuracy > 90:
            self.feedback_text.insert(tk.END, "Status: 🟡 VERY GOOD\n", ("orange", "bold"))
        else:
            self.feedback_text.insert(tk.END, "Status: 🔴 NEEDS ADJUSTMENT\n", ("red", "bold"))
        
        self.feedback_text.insert(tk.END, f"Accuracy: {self.overall_accuracy:.1f}%\n\n", "bold")

        # Add level information to feedback
        self.feedback_text.insert(tk.END, f"Current Level: {self.current_level}\n", "bold")

        # Group angles by category
        angle_groups = {
            "Legs": ["left_knee", "right_knee"],
            "Back": ["back"],
            "Thighs": ["left_thigh", "right_thigh"],
            "Feet": ["left_foot", "right_foot"]
        }

        # Add angle comparisons by group
        for group_name, angles in angle_groups.items():
            self.feedback_text.insert(tk.END, f"{group_name}:\n", "bold")
            for angle_name in angles:
                current = current_angles[angle_name]
                target = self.reference_angles[angle_name]
                diff = abs(current - target)
                
                name = angle_name.replace('_', ' ').title()
                if diff <= self.angle_tolerances[angle_name]:
                    self.feedback_text.insert(tk.END, f"✓ {name}: ", "green")
                    self.feedback_text.insert(tk.END, f"{current:.1f}° (Target: {target:.1f}°)\n")
                else:
                    self.feedback_text.insert(tk.END, f"× {name}: ", "red")
                    self.feedback_text.insert(tk.END, f"{current:.1f}° (Target: {target:.1f}°)\n")
                    if current > target:
                        feedback.append(f"Reduce {name} angle")
                    else:
                        feedback.append(f"Increase {name} angle")
            
            self.feedback_text.insert(tk.END, "\n")

        # Add suggestions if needed
        if feedback:
            self.feedback_text.insert(tk.END, "Adjustments Needed:\n", "bold")
            for suggestion in feedback[:3]:  # Show top 3 suggestions
                self.feedback_text.insert(tk.END, f"• {suggestion}\n", "red")

        # Voice feedback for improvements
        if feedback and self.feedback_cooldown <= 0:
            voice_feedback = feedback[0]  # Get the most important feedback
            if voice_feedback != self.last_voice_feedback:
                self.speak(voice_feedback)
                self.last_voice_feedback = voice_feedback
                self.feedback_cooldown = 50  # Set cooldown to avoid too frequent feedback
        
        if self.feedback_cooldown > 0:
            self.feedback_cooldown -= 1

        return "Pose check complete"

    def speak(self, text):
        """Speak the given text using Google Text-to-Speech"""
        if self.is_speaking:  # Don't interrupt if already speaking
            return
            
        def speak_thread():
            temp_file = None
            try:
                self.is_speaking = True
                
                # Generate unique temporary filename
                temp_file = os.path.join(self.temp_dir, f'speech_{threading.get_ident()}.mp3')
                
                # Generate speech
                tts = gTTS(text=text, lang='en', tld='co.in')  # Using Indian English
                
                # Save to temporary file
                tts.save(temp_file)
                
                # Stop any currently playing audio
                mixer.music.stop()
                mixer.music.unload()
                
                # Play the speech
                mixer.music.load(temp_file)
                mixer.music.play()
                
                # Wait for audio to finish
                while mixer.music.get_busy():
                    continue
                    
            except Exception as e:
                print(f"Text-to-speech error: {e}")
            finally:
                # Clean up
                self.is_speaking = False
                if temp_file and os.path.exists(temp_file):
                    try:
                        mixer.music.unload()
                        os.remove(temp_file)
                    except Exception as e:
                        print(f"Cleanup error: {e}")

        # Run speech in separate thread to avoid blocking the GUI
        threading.Thread(target=speak_thread, daemon=True).start()

    def update_frame(self):
        if self.is_running:
            ret, frame = self.video_capture.read()
            if ret:
                # Resize frame to maintain reasonable size
                frame = cv2.resize(frame, (640, 480))

                # Flip the frame horizontally for a selfie-view display
                frame = cv2.flip(frame, 1)

                # Recolor feed
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                # Make detections
                results = self.holistic.process(image)

                # Recolor image back to BGR for rendering
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                # Draw pose landmarks with color based on accuracy
                if results.pose_landmarks:
                    self.check_bharatanatyam_pose(results.pose_landmarks.landmark)
                    
                    self.mp_drawing.draw_landmarks(
                        image, 
                        results.pose_landmarks, 
                        self.mp_holistic.POSE_CONNECTIONS,
                        self.mp_drawing.DrawingSpec(
                            color=(0,255,0) if self.overall_accuracy > 95 else (0,165,255) if self.overall_accuracy > 90 else (0,0,255),
                            thickness=2, 
                            circle_radius=4
                        ),
                        self.mp_drawing.DrawingSpec(
                            color=(0,255,0) if self.overall_accuracy > 95 else (0,165,255) if self.overall_accuracy > 90 else (0,0,255),
                            thickness=2, 
                            circle_radius=2
                        )
                    )

                # Convert frame to RGB for tkinter
                frame_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

                # Convert to PhotoImage
                image = Image.fromarray(frame_rgb)
                photo = ImageTk.PhotoImage(image=image)

                self.video_label.config(image=photo)
                self.video_label.image = photo

            self.window.after(10, self.update_frame)

    def listen_for_question(self):
        """Listen for voice command and respond"""
        if self.is_listening:
            return

        def listen_thread():
            try:
                self.is_listening = True
                self.voice_command_button.config(text="🎤 Listening...")
                
                with sr.Microphone() as source:
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    audio = self.recognizer.listen(source, timeout=5)
                
                text = self.recognizer.recognize_google(audio).lower()
                print(f"Heard: {text}")
                
                # Check if the command starts with "natya"
                if text.startswith("natya"):
                    # Remove "natya" and clean up the question
                    question = text.replace("natya", "").strip()
                    self.answer_question(question)
                else:
                    self.speak("Please start your question with the word Natya")
                
            except sr.WaitTimeoutError:
                self.speak("I didn't hear anything. Please try again.")
            except sr.UnknownValueError:
                self.speak("I couldn't understand what you said. Please try again.")
            except Exception as e:
                print(f"Voice recognition error: {e}")
                self.speak("There was an error processing your question. Please try again.")
            finally:
                self.is_listening = False
                self.voice_command_button.config(text="🎤 Ask Question")

        threading.Thread(target=listen_thread, daemon=True).start()

    def answer_question(self, question):
        """Find and speak the answer to a question"""
        # Clean up the question for matching
        question = question.lower().strip()
        
        # Check if asking about current pose
        if any(phrase in question for phrase in ["what pose", "what position", "which pose"]):
            if hasattr(self, 'current_pose'):
                pose_info = self.pose_info_database.get(self.current_pose, {})
                if pose_info:
                    answer = (f"You are currently in {self.current_pose}. {pose_info['description']} "
                            f"{pose_info['tips']}")
                    self.speak(answer)
                    
                    # Log the interaction
                    self.feedback_text.insert(tk.END, "\nQ&A Interaction:\n", "bold")
                    self.feedback_text.insert(tk.END, f"Question: {question}\n")
                    self.feedback_text.insert(tk.END, f"Answer: {answer}\n")
                    return
            
            self.speak("I don't detect a clear pose at the moment. Please ensure you're in frame and maintaining the position.")
            return

        # Continue with existing question matching logic
        best_match = None
        best_ratio = 0
        
        for q in self.qa_database.keys():
            # Simple word matching
            q_words = set(q.split())
            question_words = set(question.split())
            common_words = q_words.intersection(question_words)
            ratio = len(common_words) / max(len(q_words), len(question_words))
            
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = q

        # If we found a good match
        if best_ratio > 0.3:
            answer = self.qa_database[best_match]
            # Replace placeholder if it's a pose question
            if answer == "CURRENT_POSE_PLACEHOLDER":
                if hasattr(self, 'current_pose'):
                    pose_info = self.pose_info_database.get(self.current_pose, {})
                    if pose_info:
                        answer = (f"You are currently in {self.current_pose}. {pose_info['description']} "
                                f"{pose_info['tips']}")
                else:
                    answer = "I don't detect a clear pose at the moment. Please ensure you're in frame and maintaining the position."
            self.speak(answer)
        else:
            self.speak("I'm sorry, I don't have information about that. Please try asking another question about Bharatanatyam.")

        # Log the interaction
        self.feedback_text.insert(tk.END, "\nQ&A Interaction:\n", "bold")
        self.feedback_text.insert(tk.END, f"Question: {question}\n")
        self.feedback_text.insert(tk.END, f"Answer: {answer if best_ratio > 0.3 else 'No matching answer found'}\n")

    def __del__(self):
        if hasattr(self, 'video_capture') and self.video_capture.isOpened():
            self.video_capture.release()
        if hasattr(self, 'holistic'):
            self.holistic.close()
        # Clean up temp directory
        if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
            try:
                os.rmdir(self.temp_dir)
            except:
                pass
        # Quit mixer
        if mixer.get_init():
            mixer.quit()


def main():
    root = tk.Tk()
    app = BharatanatyamPoseApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
