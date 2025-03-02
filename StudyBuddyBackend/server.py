import sys
import os
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL

# Add the directory containing WhisperDev.py to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'StudyBuddyBackend')))

from WhisperDev import transcribe_mp3, generate_summary, create_study_guide, create_practice_test, translate_text  # Import the functions from WhisperDev.py

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['MYSQL_DATABASE_HOST'] = '' # Specify Endpoint
app.config['MYSQL_DATABASE_USER'] = '' # Specify Master username
app.config['MYSQL_DATABASE_PASSWORD'] = '' # Specify Master password
app.config['MYSQL_DATABASE_DB'] = '' # Specify database name
mysql = MySQL(app)
try:
    conn = mysql.connect()
    cursor =conn.cursor()
    cursor.execute("SHOW TABLES")
    data = cursor.fetchall()
    for row in data:
        print(row)
except Exception as e:
    print(e)
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
        summary = generate_summary(transcription_text)
        if translate_flag:
            summary = translate_text(summary, target_language)
        results["summary"] = summary
        print("Summary completed")

    # Create study guide if selected
    if create_study_guide_flag:
        study_guide = create_study_guide(transcription_text)
        if translate_flag:
            study_guide = translate_text(study_guide, target_language)
        results["study_guide"] = study_guide
        print("Study Guide completed")

    # Create practice test if selected
    if create_practice_test_flag:
        practice_test = create_practice_test(transcription_text)
        if translate_flag:
            practice_test = translate_text(practice_test, target_language)
        results["practice_test"] = practice_test
        print("Practice Test completed")

    # Translate transcription if selected
    if translate_flag and target_language:
        results["translation"] = translate_text(transcription_text, target_language)
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
