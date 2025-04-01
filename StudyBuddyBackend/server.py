import sys
import os
import json
import openai
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # Import CORS
from flaskext.mysql import MySQL
from WhisperDev import transcribe_mp3, generate_summary, create_study_guide, create_practice_test, translate_text, create_flashcards  # Import functions
from Database import createAccount, deleteAccount, verifyPassword, test_create_update_read_delete, reset_database
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

try:
    conn = mysql.connect()
    cursor = conn.cursor()
    accountNum = createAccount(cursor,conn,"test","test","t1st")
    accountNum2 = createAccount(cursor,conn,"t3st","test","t3st")
    print(verifyPassword(cursor, "test", "t3st"))
    deleteAccount(cursor, conn, accountNum)
    deleteAccount(cursor, conn, accountNum)
    cursor.close()
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
        print("Transcription completed")

        # Save transcription to a file
        try:
            with open("transcription.txt", "w", encoding="utf-8") as f:
                f.write(transcription_text)
            print("Transcription saved to transcription.txt")  # Debug log
        except Exception as e:
            print(f"Error saving transcription file: {e}")

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
            raw_practice_test = create_practice_test(transcription_text)
            print("Raw practice test JSON:", raw_practice_test)  # Debug log

            try:
                # Clean up the raw practice test string if it starts with ```json
                if raw_practice_test.startswith("```json"):
                    raw_practice_test = raw_practice_test.strip("```json").strip("```").strip()

                # Parse the practice test JSON
                results["practice_test"] = json.loads(raw_practice_test)
            except json.JSONDecodeError as e:
                print(f"Error decoding practice test JSON: {e}")
                results["practice_test"] = {"error": "Failed to generate practice test"}
            print("Parsed practice test:", results["practice_test"])  # Debug log

        # Create flashcards if selected
        if create_flashcards_flag:  # Generate flashcards if selected
            raw_flashcards = create_flashcards(transcription_text)
            print("Raw flashcards from ChatGPT:", raw_flashcards)  # Debug log

            # Clean up the flashcards data
            if raw_flashcards.startswith("```json"):
                raw_flashcards = raw_flashcards.strip("```json").strip("```").strip()
                print(raw_flashcards)
            try:
                # Parse the cleaned flashcards string into a Python object
                results["flashcards"] = json.loads(raw_flashcards)
            except json.JSONDecodeError as e:
                print(f"Error decoding flashcards JSON: {e}")
                results["flashcards"] = []
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