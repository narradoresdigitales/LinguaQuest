from difflib import SequenceMatcher
import random

prompts = {
    "English": ["Hello, how are you?", "What’s your name?"],
    "Russian": ["Привет, как дела?", "Как вас зовут?"],
    "Spanish": ["Hola, ¿cómo estás?", "¿Cuál es tu nombre?"]
}

def normalize_text(text):
    return " ".join(text.lower().replace(",", "").replace("?", "").split())

def evaluate_response(user_input, lang_choice):
    expected_prompt = random.choice(prompts.get(lang_choice, []))
    if not expected_prompt:
        return {"error": "Invalid language choice"}
    if not user_input or not isinstance(user_input, str):
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
        "language": lang_choice,
        "user_input": user_input,
        "expected_prompt": expected_prompt,
        "similarity_score": round(final_score, 2),
        "ilr_level": ilr_level
    }

if __name__ == "__main__":
    print(evaluate_response("Hello, how are you?", "English"))
    print(evaluate_response("Hi how are you", "English"))
    print(evaluate_response("blah blah", "English"))