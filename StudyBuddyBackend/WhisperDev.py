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

def create_study_guide(transcription, target_language="English"):
    """Generates a study guide from the transcribed text."""
    prompt_language = f"Generate the study guide in {target_language}."
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that generates study guides. you do not need to have filler words or confirmation sentences in your response, just generate what is asked of you."},
            {"role": "user", "content": f"{prompt_language} Create a study guide and do not use any markdown formatting such as hashtags, asterisks, or backticks. Instead, organize the guide using clear, indented sections and line breaks:\n\n{transcription}"}
        ],
    )
    return response.choices[0].message.content

def create_practice_test(transcription, target_language="English"):
    """Generates a practice test from the transcribed text."""
    prompt_language = f"Generate the practice test in {target_language}."
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that generates practice tests. you do not need to have filler words or confirmation sentences in your response, just generate what is asked of you and do not translate the specified json format, just do the content."},
            {"role": "user", "content": f"""{prompt_language} Create a practice test based on the following text. The test should include at least 5 multiple-choice questions, 3 true/false questions, and 1 discussion question. Return the test in JSON format with the following structure:
{{
    "questions": [
        {{
            "type": "multiple_choice",
            "question": "Question text here",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct_answer": "Correct option here"
        }},
        {{
            "type": "true_false",
            "question": "Question text here",
            "correct_answer": true/false
        }},
        {{
            "type": "discussion",
            "question": "Question text here",
            "correct_answer": "Discussion answer here"
        }}
    ]
}}:
\n\n{transcription}"""}
        ],
    )
    return response.choices[0].message.content

def create_flashcards(transcription, target_language="English"):
    """Generates flashcards from the transcribed text."""
    prompt_language = f"Generate the flashcards in {target_language}."
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that generates flashcards. you do not need to have filler words or confirmation sentences in your response, just generate what is asked of you. for json format, do not translate the specified json format, just do the content."},
            {"role": "user", "content": f"""{prompt_language} Create flashcards from the following text. Each flashcard should have a question and an answer. Return the flashcards in JSON format as an array of objects, where each object has 'question' and 'answer' keys. The structure should look like this:
[
    {{
        "question": "Question text here",
        "answer": "Answer text here"
    }},
    {{
        "question": "Question text here",
        "answer": "Answer text here"
    }}
]:
\n\n{transcription}"""}
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
        target_language = request.form.get("targetLanguage", "English")

        # Log received data
        print("\nReceived form data:")
        print(f"Translate: {translate_flag}, Language: {target_language}")

        temp_file_path = "temp_audio.wav"
        file.save(temp_file_path)

    
        print("Transcribing in the original language...")
        transcription = transcribe_mp3(temp_file_path)
        print("Transcription completed.")

        # Generate results using the transcription (already in the target language if translation is selected)
        results = {
            "transcription": transcription,  # This will be in the target language if translation is selected
            "study_guide": create_study_guide(transcription, target_language),
        }

        # Generate practice test
        try:
            raw_practice_test = create_practice_test(transcription, target_language)
            print("Raw practice test:", raw_practice_test)

            # Clean and parse the practice test JSON
            if raw_practice_test.startswith("```json"):
                raw_practice_test = raw_practice_test.strip("```json").strip("```").strip()
            results["practice_test"] = json.loads(raw_practice_test)  # Parse into JSON object
        except json.JSONDecodeError as e:
            print(f"Error decoding practice test JSON: {e}")
            results["practice_test"] = {"error": "Failed to generate practice test"}

        # Generate flashcards
        try:
            raw_flashcards = create_flashcards(transcription, target_language)
            print("Raw flashcards:", raw_flashcards)

            # Clean and parse the flashcards JSON
            if raw_flashcards.startswith("```json"):
                raw_flashcards = raw_flashcards.strip("```json").strip("```").strip()
            results["flashcards"] = json.loads(raw_flashcards)  # Parse into JSON object
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