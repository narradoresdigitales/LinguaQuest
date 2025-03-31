from flask import Flask, request, jsonify, render_template, send_file
import openai
import os
import logging
from flask_cors import CORS
from dotenv import load_dotenv
import tempfile

# Initialize Flask app and logging
app = Flask(__name__)
CORS(app)

# Load the environment variables from the .env file
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def home():
    return render_template('index.html')

# Store prompts globally so they're consistent across requests
prompts = {
    "English": ["Describe your daily routine.", "Tell me about a place you visited."],
    "Russian": ["Опишите ваш обычный день.", "Расскажите о месте, которое вы посетили."],
    "Spanish": ["Describe tu rutina diaria.", "Cuéntame sobre un lugar que visitaste."]
}

# Function to transcribe audio using Whisper
def transcribe_audio(audio_file):
    """Send the audio file to Whisper for transcription."""
    try:
        with open(audio_file, "rb") as f:
            response = openai.Audio.transcribe("whisper-1", f)
        if "text" in response:
            return response["text"]
        else:
            logging.error(f"Whisper response did not contain transcription text: {response}")
            return None
    except Exception as e:
        logging.error(f"Whisper transcription error: {str(e)}")
        return None

# Get the prompt based on the selected language
@app.route('/prompt')
def get_prompt():
    lang_choice = request.args.get('language')
    logging.debug(f"Received language choice: {lang_choice}")

    if lang_choice in prompts:
        prompt = prompts[lang_choice]
        return jsonify({"prompt": prompt})
    
    logging.error(f"Invalid language choice: {lang_choice}")
    return jsonify({"error": "Invalid language choice"}), 400

# Route to handle user response and provide downloadable transcript
@app.route('/assess', methods=['POST'])
def assess():
    try:
        # Retrieve form data for lang_choice and the uploaded file
        lang_choice = request.form.get("lang_choice")  # For text data
        audio_file = request.files.get("audio")  # For file upload

        # Log incoming data for debugging
        logging.debug(f"Received data: lang_choice={lang_choice}")

        # Validate language choice
        if not lang_choice or lang_choice not in ["English", "Russian", "Spanish"]:
            logging.error(f"Invalid language choice: {lang_choice}")
            return jsonify({"error": "Invalid language choice"}), 400

        # Process audio file if provided
        if audio_file:
            transcript = transcribe_audio(audio_file)
            if not transcript:
                logging.error("Audio transcription failed.")
                return jsonify({"error": "Audio transcription failed"}), 500
        else:
            return jsonify({"error": "No audio file provided"}), 400

        # Log the transcript for debugging
        logging.debug(f"Transcript: {transcript}")

        # Create a temporary file for the transcript
        with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
            tmpfile.write(transcript.encode('utf-8'))
            tmpfile_path = tmpfile.name

        # Send the transcript file to the user for download
        return send_file(tmpfile_path, as_attachment=True, download_name="transcript.txt")

    except Exception as e:
        logging.error(f"Server error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

    
    

if __name__ == '__main__':
    app.run(debug=True)
