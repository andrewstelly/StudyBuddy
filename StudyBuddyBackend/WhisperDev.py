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

def generate_summary(transcription):
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
    return summary

def create_study_guide(transcription):
    # Create a study guide
    study_guide_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that summarizes text and creates study guides. If the text states that something will be on the test or is repeated multiple times then make sure it is included in the study guide."},
            {"role": "user", "content": f"Create a study guide:\n\n{transcription}"}
        ],
    )
    study_guide = study_guide_response.choices[0].message.content
    print("\nStudy Guide:")
    print(study_guide)
    return study_guide

def create_practice_test(transcription):
    # Create a practice test
    practice_test_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that summarizes text and creates study guides and practice tests."},
            {"role": "user", "content": f"Create a practice test using this information. Ensure that the multiple-choice questions have a variety of different answer choices (e.g., not all answers should be 'B'). Distribute the correct answers evenly among 'A', 'B', 'C', and 'D'. Include some true/false questions and at least one discussion question. Provide an answer key for the multiple-choice and true/false questions:\n\n{transcription}"}
        ],
    )
    practice_test = practice_test_response.choices[0].message.content
    print("\nPractice Test:")
    print(practice_test)
    return practice_test

def translate_text(text, target_language):
    # Translate the text
    translation_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that translates text."},
            {"role": "user", "content": f"Translate this text to {target_language}:\n\n{text}"}
        ],
    )
    translation = translation_response.choices[0].message.content
    print(f"\nTranslation to {target_language}:")
    print(translation)
    return translation

def main(file_path, generate_summary_flag, create_study_guide_flag, create_practice_test_flag, translate_flag, target_language):
    transcription = transcribe_mp3(file_path)
    print("Transcription has finished!")
    
    results = {"transcription": transcription}
    
    if generate_summary_flag:
        summary = generate_summary(transcription)
        if translate_flag:
            summary = translate_text(summary, target_language)
        results["summary"] = summary
    
    if create_study_guide_flag:
        study_guide = create_study_guide(transcription)
        if translate_flag:
            study_guide = translate_text(study_guide, target_language)
        results["study_guide"] = study_guide
    
    if create_practice_test_flag:
        practice_test = create_practice_test(transcription)
        if translate_flag:
            practice_test = translate_text(practice_test, target_language)
        results["practice_test"] = practice_test
    
    if translate_flag:
        results["translation"] = translate_text(transcription, target_language)
    
    return results

if __name__ == "__main__":
    file_path = input("Enter the path to the MP3 file: ")
    generate_summary_flag = input("Generate summary? (yes/no): ").lower() == "yes"
    create_study_guide_flag = input("Create study guide? (yes/no): ").lower() == "yes"
    create_practice_test_flag = input("Create practice test? (yes/no): ").lower() == "yes"
    translate_flag = input("Translate transcription? (yes/no): ").lower() == "yes"
    target_language = input("Enter the target language: ") if translate_flag else None
    main(file_path, generate_summary_flag, create_study_guide_flag, create_practice_test_flag, translate_flag, target_language)