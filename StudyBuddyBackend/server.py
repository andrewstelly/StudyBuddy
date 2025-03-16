import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from flaskext.mysql import MySQL

# Add the directory containing WhisperDev.py to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'StudyBuddyBackend')))

from WhisperDev import transcribe_mp3, generate_summary, create_study_guide, create_practice_test, translate_text  # Import functions

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['MYSQL_DATABASE_HOST'] = 'study-buddy-database.co3kew2gkyw2.us-east-1.rds.amazonaws.com' # Specify Endpoint
app.config['MYSQL_DATABASE_USER'] = 'admin' # Specify Master username
app.config['MYSQL_DATABASE_PASSWORD'] = 'StudyBuddy!' # Specify Master password
app.config['MYSQL_DATABASE_DB'] = 'study_buddy_database' # Specify database name

mysql = MySQL(app)

try:
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    data = cursor.fetchall()
    for row in data:
        print(row)
    conn.close()
except Exception as e:
    print(e)

# Handle preflight OPTIONS request for CORS
@app.route('/upload', methods=['OPTIONS'])
def options():
    response = jsonify({"message": "CORS Preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
    return response, 200

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles file upload and content generation."""
    try:
        if 'file' not in request.files:
            response = jsonify({"error": "No file part"})
            response.headers.add("Access-Control-Allow-Origin", "*")  # Allow CORS
            return response, 400

        file = request.files['file']
        if file.filename == '':
            response = jsonify({"error": "No selected file"})
            response.headers.add("Access-Control-Allow-Origin", "*")  # Allow CORS
            return response, 400

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

        # Translate if selected
        if translate_flag and target_language:
            results["translation"] = translate_text(transcription_text, target_language)
            print(f"Translation to {target_language} completed")

        # Delete the file after processing
        os.remove(file_path)
        print(f"File {file_path} deleted")

        # Explicitly set CORS headers in response
        response = jsonify({
            "message": "File uploaded and processed successfully",
            **results
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,GET,OPTIONS")

        return response, 200

    except Exception as e:
        print(f"Error: {e}")
        response = jsonify({"error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")  # Allow CORS on error response
        return response, 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)