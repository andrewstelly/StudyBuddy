import os
from dotenv import load_dotenv
import openai
import whisper

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("No API key found. Please set the OPENAI_API_KEY environment variable in your .env file.")
# Initialize the OpenAI client with the API key
client = openai.OpenAI(api_key=api_key)

def transcribe_mp3(file_path):
    # Load the Whisper model and transcribe the audio
    model = whisper.load_model("tiny")
    result = model.transcribe(file_path)

    # Get the transcription text
    transcription = result["text"]
    return transcription

def process_transcription(transcription):
    # Summarize the text
    summary_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that summarizes text."},
            {"role": "user", "content": f"Summarize this text:\n\n{transcription}"}
        ],
    )
    summary = summary_response.choices[0].message.content
    print("\nSummary:")
    print(summary)

    # Create a study guide
    study_guide_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that summarizes text and creates study guides."},
            {"role": "user", "content": f"Create a study guide:\n\n{transcription}"}
        ],
    )
    study_guide = study_guide_response.choices[0].message.content
    print("\nStudy Guide:")
    print(study_guide)

    # Create a practice test
    practice_test_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that summarizes text and creates study guides and practice tests."},
            {"role": "user", "content": f"Create a practice test using this information. Make sure that the multiple choice answers have range of different options and are not always one choice (for example making them all B). also include some true and false and at least one discussion question:\n\n{transcription}"}
        ],
    )
    practice_test = practice_test_response.choices[0].message.content
    print("\nPractice Test:")
    print(practice_test)

    return summary, study_guide, practice_test

def main(file_path):
    transcription = transcribe_mp3(file_path)
    print("Transcription has finished!")
    summary, study_guide, practice_test = process_transcription(transcription)
    return summary, study_guide, practice_test

if __name__ == "__main__":
    file_path = input("Enter the path to the MP3 file: ")
    main(file_path)

