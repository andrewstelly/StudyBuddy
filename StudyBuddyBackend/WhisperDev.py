import os
from dotenv import load_dotenv
import openai
import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS
from flaskext.mysql import MySQL
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Load environment variables
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("No API key found. Please set the OPENAI_API_KEY environment variable in your .env file.")

# Initialize OpenAI client
client = openai.OpenAI(api_key=api_key)

def transcribe_mp3(file_path):
    """Transcribes audio using Whisper."""
    model = whisper.load_model("tiny")
    result = model.transcribe(file_path)
    return result["text"]

def create_study_guide(transcription):
    """Creates a study guide from the transcribed text."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that creates detailed study guides."},
            {"role": "user", "content": f"Create a study guide and do not use any markdown formatting such as hashtags, asterisks, or backticks. Instead, organize the guide using clear, indented sections and line breaks:\n\n{transcription}"}
        ],
    )
    return response.choices[0].message.content

def create_practice_test(transcription):
    """Generates a practice test with multiple-choice, true/false, and discussion questions."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that generates practice tests."},
            {"role": "user", "content": f"Create a practice test based on the following text. The test should include at least 5 multiple-choice questions, 3 true/false questions, and 1 discussion question. Return the test in JSON format with the following structure: {{'questions': [{{'type': 'multiple_choice', 'question': '...', 'options': ['...'], 'correct_answer': '...'}}, {{'type': 'true_false', 'question': '...', 'correct_answer': true/false}}, {{'type': 'discussion', 'question': '...', 'correct_answer': '...'}}]}}:\n\n{transcription}"}
        ],
    )
    return response.choices[0].message.content

def translate_text(text, target_language):
    """Translates text into the target language."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI translator."},
            {"role": "user", "content": f"Translate this text to {target_language}:\n\n{text}"}
        ],
    )
    return response.choices[0].message.content

def create_flashcards(transcription):
    """Generates flashcards from the transcribed text."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that generates flashcards."},
            {"role": "user", "content": f"Create flashcards from the following text. Each flashcard should have a question and an answer. Return the flashcards in JSON format as an array of objects, where each object has 'question' and 'answer' keys:\n\n{transcription}"}
        ],
    )
    return response.choices[0].message.content

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles file upload and content generation."""
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file provided"}), 400

        # Read user selections from form data
        translate_flag = request.form.get("translate") == "true"
        target_language = request.form.get("targetLanguage", "")

        # Log received data
        print("\nReceived form data:")
        print(f"Translate: {translate_flag}, Language: {target_language}")

        temp_file_path = "temp_audio.wav"
        file.save(temp_file_path)

        # Transcribe audio directly into the target language if translation is selected
        if translate_flag and target_language:
            print(f"Transcribing directly into {target_language}...")
            transcription = transcribe_mp3(temp_file_path)  # Transcribe in the original language
            transcription = translate_text(transcription, target_language)  # Translate directly
            print(f"Transcription in {target_language} completed.")
        else:
            print("Transcribing in the original language...")
            transcription = transcribe_mp3(temp_file_path)
            print("Transcription completed.")

        # Generate results using the transcription (already in the target language if translation is selected)
        results = {
            "transcription": transcription,  # This will be in the target language if translation is selected
            "study_guide": create_study_guide(transcription),
        }

        # Generate practice test
        try:
            raw_practice_test = create_practice_test(transcription)
            print("Raw practice test:", raw_practice_test)

            # Clean and parse the practice test JSON
            if raw_practice_test.startswith("```json"):
                raw_practice_test = raw_practice_test.strip("```json").strip("```").strip()
            results["practice_test"] = json.loads(raw_practice_test)
        except json.JSONDecodeError as e:
            print(f"Error decoding practice test JSON: {e}")
            results["practice_test"] = {"error": "Failed to generate practice test"}

        # Generate flashcards
        try:
            raw_flashcards = create_flashcards(transcription)
            print("Raw flashcards:", raw_flashcards)

            # Clean and parse the flashcards JSON
            if raw_flashcards.startswith("```json"):
                raw_flashcards = raw_flashcards.strip("```json").strip("```").strip()
            results["flashcards"] = json.loads(raw_flashcards)
        except json.JSONDecodeError as e:
            print(f"Error decoding flashcards JSON: {e}")
            results["flashcards"] = []

        # Log final results
        print("\nFinal Generated Content:")
        print(results)

        os.remove(temp_file_path)

        return jsonify(results)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)