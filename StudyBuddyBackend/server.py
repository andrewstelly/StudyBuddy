import sys
import os
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # Import CORS
from flaskext.mysql import MySQL
from WhisperDev import transcribe_mp3, generate_summary, create_study_guide, create_practice_test, translate_text, create_flashcards  # Import functions
from Database import createAccount, createFolder, createTranscription, createSummary, createFlashcard, createFlashcardSet, createStudyGuide,createPracticeTest,read_database,reset_database
# Add the directory containing WhisperDev.py to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'StudyBuddyBackend')))



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
    read_database(cursor,conn)
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
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

        # Read form data flags
        generate_summary_flag = request.form.get("summary") == "true"
        create_study_guide_flag = request.form.get("studyGuide") == "true"
        create_practice_test_flag = request.form.get("practiceTest") == "true"
        create_flashcards_flag = request.form.get("flashcards") == "true"  # New flag for flashcards
        translate_flag = request.form.get("translate") == "true"
        target_language = request.form.get("targetLanguage")

        results = {}

        # Always transcribe the file
        transcription_text = transcribe_mp3(file_path)
        results["transcription"] = transcription_text
        print(transcription_text)

        print("Transcription completed")
        transcription_num = -1
        folder_num =-1
        # Save transcription to a file
        try:
            folder_num = storeFolder(mysql, "Test Folder", 111)
            with open("transcription.txt", "w", encoding="utf-8") as f:
                f.write(transcription_text)
                transcription_num = storeTranscription(mysql,"Transcription Name", transcription_text,111,folder_num)
            print("Transcription saved to transcription.txt")  # Debug log
        except Exception as e:
            print(f"Error saving transcription file: {e}")

        # Generate summary if selected
        if generate_summary_flag:
            results["summary"] = generate_summary(transcription_text)
            storeSummary(mysql, "Summary Name", results["summary"], 111, transcription_num, folder_num)
            print("Summary completed")

        # Create study guide if selected
        if create_study_guide_flag:
            results["study_guide"] = create_study_guide(transcription_text)
            storeStudyGuide(mysql, "Summary Name", results["summary"], 111, transcription_num, folder_num)
            print("Study Guide completed")

        # Create practice test if selected
        if create_practice_test_flag:
            results["practice_test"] = create_practice_test(transcription_text)
            #storePracticeTest(mysql,results["practice_test"],111,transcription_num,folder_num)
            print("Practice Test completed")

        # Create flashcards if selected
        if create_flashcards_flag:  # Generate flashcards if selected
            raw_flashcards = create_flashcards(transcription_text)
            print("Raw flashcards from ChatGPT:", raw_flashcards)  # Debug log

            # Clean up the flashcards data
            if raw_flashcards.startswith("```json"):
                raw_flashcards = raw_flashcards.strip("```json").strip("```").strip()
                
            try:
                # Parse the cleaned flashcards string into a Python object
                results["flashcards"] = json.loads(raw_flashcards)          
            except json.JSONDecodeError as e:
                print(f"Error decoding flashcards JSON: {e}")
                results["flashcards"] = []
            storeFlashcards(mysql,raw_flashcards,111,transcription_num,folder_num)
            print("Cleaned flashcards:", results["flashcards"])  # Debug log

        # Translate if selected
        if translate_flag and target_language:
            results["translation"] = translate_text(transcription_text, target_language)
            print(f"Translation to {target_language} completed")

        # Delete the file after processing
        os.remove(file_path)
        print(f"File {file_path} deleted")

        # Explicitly set CORS headers in response
        print("Final results being sent to frontend:", results)  # Debug log
        response = jsonify({
            "message": "File uploaded and processed successfully",
            **results
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,GET,OPTIONS")

        print("Final JSON response to frontend:", response.get_json())  # Debug log

        return response, 200

    except Exception as e:
        print(f"Error: {e}")
        response = jsonify({"error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")  # Allow CORS on error response
        return response, 500

@app.route('/download-transcription', methods=['GET'])
def download_transcription():
    """Serve the transcription file for download."""
    try:
        transcription_file_path = os.path.join(os.getcwd(), "transcription.txt")  # Ensure correct path
        if not os.path.exists(transcription_file_path):
            print("Transcription file does not exist.")  # Debug log
            return jsonify({"error": "Transcription file not found"}), 404
        return send_file(transcription_file_path, as_attachment=True)
    except Exception as e:
        print(f"Error serving transcription file: {e}")
        return jsonify({"error": "Failed to download transcription"}), 500
def storeFolder(mysql, FolderName, AccountNum):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        FolderNum = createFolder(cursor,conn,FolderName,AccountNum)
        cursor.close()
        conn.close()
        return FolderNum
    except Exception as e:
        print(e)
        return "null"
def storeTranscription(mysql, TranscriptionName, TranscriptionText, AccountNum,FolderNum="null"):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        TranscriptionNum = createTranscription(cursor,conn, TranscriptionName, TranscriptionText, AccountNum,FolderNum)
        cursor.close()
        conn.close()
        return TranscriptionNum
    except Exception as e:
        print(e)
        return "null"
def storeSummary(mysql,SummaryName, SummaryText, AccountNum, TranscriptionNum, FolderNum="null"):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        SummaryNum = createSummary(cursor,conn, SummaryName, SummaryText, AccountNum, TranscriptionNum, FolderNum)
        cursor.close()
        conn.close()
        return SummaryNum
    except Exception as e:
        print(e)
        return "null"
def storeStudyGuide(mysql,StudyGuideName, StudyGuideText, AccountNum, TranscriptionNum, FolderNum):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        SummaryNum = createStudyGuide(cursor,conn, StudyGuideName, StudyGuideText, AccountNum, TranscriptionNum, FolderNum)
        cursor.close()
        conn.close()
        return SummaryNum
    except Exception as e:
        print(e)
        return "null"
def storePracticeTest(mysql, PracticeTestName, AccountNum, TranscriptionNum, FolderNum="null"):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        PracticeTestNum = createPracticeTest(cursor,conn, PracticeTestName, AccountNum, TranscriptionNum, FolderNum)
        cursor.close()
        conn.close()
        return PracticeTestNum
    except Exception as e:
        print(e)
        return "null"
def storeFlashcards(mysql, raw_flashcards, AccountNum, TranscriptNum,FolderNum="null"):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        flashcardSetNum = createFlashcardSet(cursor,conn,"testSet", AccountNum, TranscriptNum,FolderNum)
        data = json.loads(raw_flashcards)
        for flashcard in data:
            createFlashcard(cursor,conn,flashcard.get('question'),flashcard.get('answer'),flashcardSetNum)
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(e)
        return "null"
    """Stores Flashcards in the database"""
if __name__ == '__main__':
    app.run(debug=True, port=5000)