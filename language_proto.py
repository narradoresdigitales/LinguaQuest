import speech_recognition as sr
from difflib import SequenceMatcher

# Language options and prompts
languages = {"1": "English", "2": "Russian", "3": "Spanish"}
prompts = {"English": "Hello, how are you?", "Russian": "Привет, как дела?", "Spanish": "Hola, ¿cómo estás?"}
lang_codes = {"English": "en-US", "Russian": "ru-RU", "Spanish": "es-ES"}

# Get user choice
print("Pick a language: 1 = English, 2 = Russian, 3 = Spanish")
choice = input("Enter number: ").strip()

while choice not in languages:
    print("Invalid choice! Try again.")
    choice = input("Enter number: ").strip()

target_lang = languages[choice]
expected_prompt = prompts[target_lang]

# Initialize speech recognizer and microphone
recognizer = sr.Recognizer()

print(f"\n🎙 Speak in {target_lang}: '{expected_prompt}'")
try:
    with sr.Microphone() as mic:
        recognizer.adjust_for_ambient_noise(mic, duration=1)  # Reduce background noise
        print("🎤 Listening... Please say the phrase clearly.")
        
        audio = recognizer.listen(mic, timeout=5)  # 5-second timeout
        print("✅ Processing your response...")

    try:
        # Convert speech to text
        text = recognizer.recognize_google(audio, language=lang_codes[target_lang])
        print(f"🗣 You said: {text}")

        # Calculate similarity
        similarity = SequenceMatcher(None, text.lower(), expected_prompt.lower()).ratio()

        # Assign ILR Level
        if similarity > 0.9:
            level = "🔵 ILR Level 1: Excellent! You matched the phrase very well."
        elif similarity > 0.6:
            level = "🟡 ILR Level 0+: Good attempt, but there's room for improvement."
        else:
            level = "🔴 ILR Level 0: Needs work. Try again with clearer pronunciation."

        print(level)

    except sr.UnknownValueError:
        print("⚠️ Sorry, I couldn't understand you. Please try again. (ILR Level 0)")
    except sr.RequestError:
        print("🚨 Google Speech API is unavailable. Please check your internet connection.")

except Exception as e:
    print(f"❌ Error: {e}")
