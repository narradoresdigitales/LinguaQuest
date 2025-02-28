import openai
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Set up the API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Test: Make a simple API request (e.g., using GPT-3 model)
response = openai.Completion.create(
    model="gpt-3.5-turbo",  # Replace with your preferred model
    prompt="Say hello to the world.",
    max_tokens=50
)

# Print the result
print(response.choices[0].text.strip())
