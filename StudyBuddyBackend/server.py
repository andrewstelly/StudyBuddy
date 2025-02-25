import sys
import os
from flask import Flask, request, jsonify

# Add the directory containing WhisperDev.py to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'StudyBuddyBackend')))

from WhisperDev import transcribe_mp3, generate_summary, create_study_guide, create_practice_test, translate_transcription  # Import the functions from WhisperDev.py

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        print("No file part in request")
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        print("No selected file")
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    print(f"File saved to {file_path}")

    generate_summary_flag = request.form.get("summary") == "true"
    create_study_guide_flag = request.form.get("studyGuide") == "true"
    create_practice_test_flag = request.form.get("practiceTest") == "true"
    translate_flag = request.form.get("translate") == "true"
    target_language = request.form.get("targetLanguage")

    results = {}

    # Always transcribe the file
    transcription_text = transcribe_mp3(file_path)
    results["transcription"] = transcription_text
    print("Transcription completed")

    # Generate summary if selected
    if generate_summary_flag:
        results["summary"] = generate_summary(transcription_text)
        print("Summary completed")

    # Create study guide if selected
    if create_study_guide_flag:
        results["study_guide"] = create_study_guide(transcription_text)
        print("Study Guide completed")

    # Create practice test if selected
    if create_practice_test_flag:
        results["practice_test"] = create_practice_test(transcription_text)
        print("Practice Test completed")

    # Translate transcription if selected
    if translate_flag and target_language:
        results["translation"] = translate_transcription(transcription_text, target_language)
        print(f"Translation to {target_language} completed")

    # Delete the file after processing
    os.remove(file_path)
    print(f"File {file_path} deleted")

    return jsonify({
        "message": "File uploaded and processed successfully",
        **results
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)