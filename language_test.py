import speech_recognition as sr
from difflib import SequenceMatcher

# Language options and prompts
languages = {"1": "English", "2": "Russian", "3": "Spanish"}
prompts = {"English": "Hello, how are you?", "Russian": "Привет, как дела?", "Spanish": "Hola, ¿cómo estás?"}
lang_codes = {"English": "en-US", "Russian": "ru-RU", "Spanish": "es-ES"}

# Get user choice
print("Pick a language: 1 = English, 2 = Russian, 3 = Spanish")
choice = input("Enter number: ")
while choice not in languages:
    print("Invalid choice! Try again.")
    choice = input("Enter number: ")
target_lang = languages[choice]
expected_prompt = prompts[target_lang]

# Speech recognition
recognizer = sr.Recognizer()
mic = sr.Microphone()

print(f"Say in {target_lang}: '{expected_prompt}'")
try:
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)  # Calibrate mic
        print("Listening for 5 seconds...")
        audio = recognizer.listen(source, timeout=5)  # 5-sec timeout
    try:
        text = recognizer.recognize_google(audio, language=lang_codes[target_lang])
        print(f"You said: {text}")

        # Basic ILR scoring using string similarity
        similarity = SequenceMatcher(None, text.lower(), expected_prompt.lower()).ratio()
        if similarity > 0.9:  # Very close match
            print("Great! ILR Level 1: You nailed a basic phrase.")
        elif similarity > 0.6:  # Partial match
            print("Good! ILR Level 0+: Getting there, but needs improvement.")
        else:  # Poor match or no recognition
            print("Try again! ILR Level 0: Minimal or no understanding.")
    except sr.UnknownValueError:
        print("Sorry, couldn’t understand you! ILR Level 0: No understanding.")
    except sr.RequestError as e:
        print(f"Google API error: {e}")
except Exception as e:
    print(f"An error occurred: {e}")