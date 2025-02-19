import sys
import os
from flask import Flask, request, jsonify

# Add the directory containing WhisperDev.py to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'StudyBuddyBackend')))

from WhisperDev import main as process_mp3  # Import the main function from WhisperDev.py

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
    
    # Call the main function from WhisperDev.py to process the MP3 file
    summary, study_guide, practice_test = process_mp3(file_path)
    print("Processing completed")
    
    # Delete the file after processing
    os.remove(file_path)
    print(f"File {file_path} deleted")
    
    return jsonify({
        "message": "File uploaded and processed successfully",
        "summary": summary,
        "study_guide": study_guide,
        "practice_test": practice_test
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)