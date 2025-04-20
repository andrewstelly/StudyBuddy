import sys
import os
import json
import openai
import bcrypt
from flask import Flask, request, jsonify, send_file,session, make_response
from flask_cors import CORS  # Import CORS
from flaskext.mysql import MySQL
from WhisperDev import transcribe_mp3, create_study_guide, create_practice_test, translate_text, create_flashcards  # Removed generate_summary
from Database import verifyPassword, retrieveAllFilesInFolder, retrieveFile, createTranscription, createFolder, createAccount,retrieveAllFolders, combine_into_json, createFlashcard, createFlashcardSet, createStudyGuide, createPracticeTest, createQuestion, createAnswer,read_database,reset_database

# Add the directory containing WhisperDev.py to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'StudyBuddyBackend')))

api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['MYSQL_DATABASE_HOST'] = 'study-buddy-database.co3kew2gkyw2.us-east-1.rds.amazonaws.com' # Specify Endpoint
app.config['MYSQL_DATABASE_USER'] = 'admin' # Specify Master username
app.config['MYSQL_DATABASE_PASSWORD'] = 'StudyBuddy!' # Specify Master password
app.config['MYSQL_DATABASE_DB'] = 'study_buddy_database' # Specify database name

mysql = MySQL(app)
app.accountNum = None


# Handle preflight OPTIONS request for CORS
@app.route('/upload', methods=['OPTIONS'])
def options():
    response = jsonify({"message": "CORS Preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
    return response, 200

@app.route('/register', methods=['OPTIONS'])
def register_options():
    response = jsonify({"message": "CORS Preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
    return response, 200
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('fullname')  # frontend sends it as 'fullname'
    password = data.get('password')

    if not email or not username or not password:
        return jsonify({'error': 'Missing fields'}), 400

    conn = mysql.connect()
    cursor = conn.cursor()
    try:
        account_id = createAccount(cursor, conn, email, username, password)
        return jsonify({'message': 'Account created', 'account_id': account_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing fields'}), 400
    elif email == "1@1.com" and password == "1":
        app.accountNum = None
        return jsonify({'message': 'Login successful'}), 200
    else:
        try:
            conn = mysql.connect()
            cursor = conn.cursor()
            verified, app.accountNum = verifyPassword(cursor, email, password) #add password login functionality
            if verified:  # assuming password is at index 2
                cursor.close()
                conn.close()
                return jsonify({'message': 'Login successful'}), 200
            else:
                cursor.close()
                conn.close()
                return jsonify({'error': 'Invalid credentials'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            

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
        translate_flag = request.form.get("translate") == "true"
        target_language = request.form.get("targetLanguage")

         # Transcribe audio
        print("Starting transcription...")
        transcription_text = transcribe_mp3(file_path)  # Transcribe in the original language
        print("Transcription completed.")

        # Translate transcription if translation is selected
        if translate_flag and target_language:
            print(f"Translating transcription directly into {target_language}...")
            transcription_text = translate_text(transcription_text, target_language)
            print(f"Transcription in {target_language} completed.")
        if(app.accountNum != None):
           app.folder_num = storeFolder(mysql, "Test Folder", app.accountNum)
           transcription_num = storeTranscription(mysql,"Transcription Name", transcription_text,app.accountNum,app.folder_num )
        # Add transcription to results
        results = {
            "transcription": transcription_text  # This will be in the target language if translation is selected
        }

        # Always create study guide
        results["study_guide"] = create_study_guide(transcription_text)
        print("Study Guide:", results["study_guide"])  # Log study guide
        if(app.accountNum != None):
            storeStudyGuide(mysql, "StudyGuide Name", results["study_guide"], app.accountNum, transcription_num, app.folder_num )
        # Always create practice test
        raw_practice_test = create_practice_test(transcription_text)
        print("Raw practice test output:", raw_practice_test)  # Debugging log
        try:
            # Check if the raw practice test is empty
            if not raw_practice_test.strip():
                raise ValueError("Practice test generation returned an empty response.")

            # Clean up the raw practice test string if it starts with ```json
            if raw_practice_test.startswith("```json"):
                raw_practice_test = raw_practice_test.strip("```json").strip("```").strip()
            
            # Parse the practice test JSON
            results["practice_test"] = json.loads(raw_practice_test)
            if (app.accountNum != None):
                storePracticeTest(mysql,results["practice_test"],"Test Practice Test",app.accountNum,transcription_num,app.folder_num)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error decoding practice test JSON: {e}")
            results["practice_test"] = {"error": "Failed to generate practice test"}
        print("Practice Test:", results["practice_test"])  # Log practice test

        # Always create flashcards
        raw_flashcards = create_flashcards(transcription_text)
        print("Raw flashcards output:", raw_flashcards)  # Debugging log
        try:
            # Check if the raw flashcards are empty
            if not raw_flashcards.strip():
                raise ValueError("Flashcards generation returned an empty response.")

            # Clean up the flashcards data
            if raw_flashcards.startswith("```json"):
                raw_flashcards = raw_flashcards.strip("```json").strip("```").strip()
            
            # Parse the cleaned flashcards string into a Python object
            results["flashcards"] = json.loads(raw_flashcards)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error decoding flashcards JSON: {e}")
            results["flashcards"] = []
        if(session.get("account_num")!= None):
            storeFlashcards(mysql, results["flashcards"],session.get("account_num"),transcription_num,session.get("folder_num"))  
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
@app.route('/retrieve-folders', methods=['POST'])
def retrieve_folders():
    app.config['MYSQL_DATABASE_HOST'] = 'study-buddy-database.co3kew2gkyw2.us-east-1.rds.amazonaws.com' # Specify Endpoint
    app.config['MYSQL_DATABASE_USER'] = 'admin' # Specify Master username
    app.config['MYSQL_DATABASE_PASSWORD'] = 'StudyBuddy!' # Specify Master password
    app.config['MYSQL_DATABASE_DB'] = 'study_buddy_database' # Specify database name
    mysql = MySQL(app)
    folder_data = retrieveAllFolders(MySQL,app.accountNum)
    with open("folder_data.json", "w") as file:
        json.dump(folder_data, file, indent=4) # indent for pretty printing
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
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
def storePracticeTest(mysql, data, PracticeTestName, AccountNum, TranscriptionNum, FolderNum="null"):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        PracticeTestNum = createPracticeTest(cursor,conn, PracticeTestName, AccountNum, TranscriptionNum, FolderNum)
        for question in data['questions']:
            questionNum = createQuestion(cursor, conn, question['type'],question['question'],PracticeTestNum,TranscriptionNum)
            if(question['type'] == "multiple_choice"):
                for answer in question.get('options'):
                    if(answer == question['correct_answer']):
                        createAnswer(cursor,conn, answer, questionNum,1)
                    else:
                        createAnswer(cursor,conn, answer, questionNum,0)
            elif(question.get('type') == "true_false"):
                if(question['correct_answer']=="false"):
                    createAnswer(cursor, conn, "True",questionNum,0)
                    createAnswer(cursor, conn, "False",questionNum,1)
                else:
                    createAnswer(cursor, conn, "True",questionNum,1)
                    createAnswer(cursor, conn, "False",questionNum,0)
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
        for flashcard in raw_flashcards:
            createFlashcard(cursor,conn,flashcard['question'],flashcard['answer'],flashcardSetNum)
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(e)
        return "null"
    """Stores Flashcards in the database"""

@app.route('/grade-test', methods=['POST'])
def grade_test():
    """Grades the user's practice test responses."""
    try:
        data = request.json
        user_responses = data.get("responses", [])
        practice_test = data.get("practice_test", {})
        graded_results = []

        for question, response in zip(practice_test.get("questions", []), user_responses):
            if question["type"] in ["multiple_choice", "true_false"]:
                is_correct = response == question["correct_answer"]
                graded_results.append({
                    "question": question["question"],
                    "user_response": response,
                    "correct": is_correct,
                    "correct_answer": question["correct_answer"]
                })
            elif question["type"] == "discussion":
                # Use ChatGPT to evaluate discussion responses
                evaluation_result = evaluate_discussion_response(response, question["correct_answer"])
                graded_results.append({
                    "question": question["question"],
                    "user_response": response,
                    "evaluation": evaluation_result["evaluation"],
                    "correct": evaluation_result["correct"]
                })

        return jsonify({"graded_results": graded_results}), 200
    except Exception as e:
        print(f"Error grading test: {e}")
        return jsonify({"error": str(e)}), 500
@app.route('/regenerate-practice-test', methods=['POST'])
def regenerate_practice_test():
    """Regenerates the practice test using the existing transcription."""
    try:
        data = request.json
        transcription_text = data.get("transcription")

        if not transcription_text:
            return jsonify({"error": "No transcription provided"}), 400

        # Regenerate the practice test
        raw_practice_test = create_practice_test(transcription_text)
        print("Raw practice test output:", raw_practice_test)  # Debugging log

        try:
            # Check if the raw practice test is empty
            if not raw_practice_test.strip():
                raise ValueError("Practice test generation returned an empty response.")

            # Clean up the raw practice test string if it starts with ```json
            if raw_practice_test.startswith("```json"):
                raw_practice_test = raw_practice_test.strip("```json").strip("```").strip()

            # Parse the practice test JSON
            practice_test = json.loads(raw_practice_test)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error decoding practice test JSON: {e}")
            return jsonify({"error": "Failed to generate practice test"}), 500

        return jsonify({"practice_test": practice_test}), 200

    except Exception as e:
        print(f"Error regenerating practice test: {e}")
        return jsonify({"error": str(e)}), 500

def evaluate_discussion_response(user_response, expected_answer):
    """Evaluates a discussion response using ChatGPT."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that evaluates discussion answers."},
            {"role": "user", "content": f"Evaluate the following response to the question. Provide a grade (correct/incorrect), what the correct answer is, and a brief explanation on why they did not get credit if they got it wrong:\n\nQuestion: {expected_answer}\n\nUser Response: {user_response}"}
        ],
    )
    evaluation_text = response.choices[0].message.content

    # Parse the evaluation to determine if the answer is correct
    is_correct = "correct" in evaluation_text.lower() and "incorrect" not in evaluation_text.lower()

    return {
        "evaluation": evaluation_text,
        "correct": is_correct
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)
