import os
from dotenv import load_dotenv
import openai
import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS
from flaskext.mysql import MySQL
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

def generate_summary(transcription):
    """Generates a summary of the transcribed text."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that summarizes text."},
            {"role": "user", "content": f"Summarize this text:\n\n{transcription}"}
        ],
    )
    return response.choices[0].message.content

def create_study_guide(transcription):
    """Creates a study guide from the transcribed text."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that creates detailed study guides."},
            {"role": "user", "content": f"Create a study guide:\n\n{transcription}"}
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
        generate_summary_flag = request.form.get("summary") == "true"
        create_study_guide_flag = request.form.get("studyGuide") == "true"
        create_practice_test_flag = request.form.get("practiceTest") == "true"
        create_flashcards_flag = request.form.get("flashcards") == "true"
        translate_flag = request.form.get("translate") == "true"
        target_language = request.form.get("targetLanguage", "")

        # Log received data
        print("\nReceived form data:")
        print(f"Summary: {generate_summary_flag}")
        print(f"Study Guide: {create_study_guide_flag}")
        print(f"Practice Test: {create_practice_test_flag}")
        print(f"Flashcards: {create_flashcards_flag}")
        print(f"Translate: {translate_flag}, Language: {target_language}")

        temp_file_path = "temp_audio.mp3"
        file.save(temp_file_path)

        # Transcribe audio
        transcription = transcribe_mp3(temp_file_path)
        print("Transcription completed.")

        # Translate transcription if translation is selected
        if translate_flag and target_language:
            print(f"Translating transcription to {target_language}...")
            transcription = translate_text(transcription, target_language)
            print("Translation completed.")

        results = {
            "transcription": transcription  # This will now hold either the original or translated transcription
        }

        # Generate summary if selected
        if generate_summary_flag:
            print("Generating summary...")
            results["summary"] = generate_summary(transcription)

        # Create study guide if selected
        if create_study_guide_flag:
            print("Generating study guide...")
            results["study_guide"] = create_study_guide(transcription)

        # Create practice test if selected
        if create_practice_test_flag:
            print("Generating practice test...")
            results["practice_test"] = create_practice_test(transcription)
            print("Generated Practice Test:", results["practice_test"])

        # Create flashcards if selected
        if create_flashcards_flag:
            print("Generating flashcards...")
            results["flashcards"] = create_flashcards(transcription)

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