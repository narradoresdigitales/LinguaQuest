from flask import Flask, request, jsonify, render_template
from difflib import SequenceMatcher
import random
import logging
import os

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# Store prompts globally so they're consistent across requests
prompts = {
    "English": ["Hello, how are you?", "What’s your name?"],
    "Russian": ["Привет, как дела?", "Как вас зовут?"],
    "Spanish": ["Hola, ¿cómo estás?", "¿Cuál es tu nombre?"]
}

def normalize_text(text):
    """Remove punctuation and extra spaces for fairer comparison."""
    return " ".join(text.lower().replace(",", "").replace("?", "").split())

def evaluate_response(user_input, lang_choice, expected_prompt):
    if not expected_prompt:
        return {"error": "Invalid language choice"}
    if not user_input.strip() or not isinstance(user_input, str):
        return {"error": "Invalid user input"}

    norm_input = normalize_text(user_input)
    norm_prompt = normalize_text(expected_prompt)

    similarity = SequenceMatcher(None, norm_input, norm_prompt).ratio()
    input_words = set(norm_input.split())
    prompt_words = set(norm_prompt.split())
    word_overlap = len(input_words & prompt_words) / len(prompt_words) if prompt_words else 0
    final_score = (similarity * 0.7 + word_overlap * 0.3)

    if final_score > 0.8:
        ilr_level = "ILR Level 1: Excellent, native-like response!"
    elif final_score > 0.5:
        ilr_level = "ILR Level 0+: Good effort, but room to improve."
    else:
        ilr_level = "ILR Level 0: Keep practicing!"

    return {
        "ilr_level": ilr_level,
        "similarity_score": round(final_score, 2),
        "user_input": user_input,
        "expected_prompt": expected_prompt
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/prompt', methods=['GET'])
def get_prompt():
    try:
        lang_choice = request.args.get('language')
        valid_languages = ["English", "Russian", "Spanish"]
        if not lang_choice or lang_choice not in valid_languages:
            return jsonify({"error": "Invalidlanguage choice"}), 400
        
        prompt = random.choice(prompts[lang_choice])
        return jsonify({"prompt": prompt})
    except Exception as e:
        app.logger.error(f"Server error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/assess', methods=['POST'])
def assess():
    try:
        data = request.get_json(force=True)
        app.logger.debug(f"Received data: {data}")

        user_input = data.get("user_input", "")
        lang_choice = data.get("lang_choice", "")
        expected_prompt = data.get("expected_prompt", "")  # Frontend sends the prompt it displayed

        if not user_input or not lang_choice or not expected_prompt:
            return jsonify({"error": "Missing required data"}), 400

        valid_languages = ["English", "Russian", "Spanish"]
        if lang_choice not in valid_languages:
            app.logger.debug(f"Invalid language choice received: {lang_choice}")
            return jsonify({"error": "Invalid language choice"}), 400

        result = evaluate_response(user_input, lang_choice, expected_prompt)
        return jsonify(result)

    except Exception as e:
        app.logger.error(f"Server error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
