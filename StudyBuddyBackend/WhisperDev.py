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

selection = True
user_choice = 25 #will be used later for while loop
#Will be used later for if statements to prevent user from over using chatgpt and spending my money:
count1 = 0 
count2 = 0 
count3 = 0

#prompts the user to choose between transcribing an mp3 file or using a pre-existing text file
while selection == True:
    print("What would you like to do?")
    print("1. Transcribe mp3 file to text")
    print("2. Use a pre-existing text file")
    
    user_choice = int(input("Enter your choice: "))
    if user_choice == 1:
        # Load the Whisper model and transcribe the audio
        model = whisper.load_model("tiny")

        user_mp3 = input("Enter the name of the mp3 file: ")
        result = model.transcribe(user_mp3+".mp3")

        # Get the transcription text
        transcription = result["text"]
        print("Transcription has finished!")
        print("Would you like a copy of the transcription? (yes or no)")
        
        #prompts the user to save the transcription to a text file
        while user_choice == True:
            user_choice = input("Enter your choice: ")
            
            if user_choice == "yes" or "Yes":
                output_file_name = input("Enter the name of the text file to save the transcription (without extension): ")
                with open(output_file_name+".txt", "w") as file:
                    file.write(transcription)
                print(f"Transcription has been saved to {output_file_name}.txt")
                break

            elif user_choice == "no" or "No":
                print("Transcription has not been saved.")
                break

            else:
                print("Invalid choice. Please type either 'yes' or 'no'.")
        break

    elif user_choice == 2:
        user_text = input("Enter the name of the text file: ")
        #These two lines of code will read the transcription from the file transcription.txt and then convert it into a basic string that will be put into chatgpt
        with open(user_text+".txt", "r") as file:
            transcription = file.read()
        print("Transcription has been loaded!")
        break
    else:
        print("Invalid choice. Please try again.")

while selection == True:
    print("Please choose from the following options:")
    print("1. Summarize the text")
    print("2. Create a study guide")
    print("3. Make a practice test")
    print("0. Exit")
    
    user_choice = int(input("Enter your choice: "))
    
    #Code for if the user wants a summary of the transcription
    if user_choice == 1:
        count1 += 1
        if count1 == 2:
            print("This is your previous summary: ")
            print (summary)
            continue

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI that summarizes text."},
                {"role": "user", "content": f"Summarize this text:\n\n{transcription}"}
            ],
        )
        print("\nSummary:")
        print(response.choices[0].message.content)
        summary = response.choices[0].message.content
   
   #Code for if the user wants a study guide of the transcription
    elif user_choice == 2:
        count2 += 1
        if count2 == 2:
            print("This is your previous study guide: ")
            print(study_guide)
            continue
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI that summarizes text and creates study guides."},
                {"role": "user", "content": f"create a study guide:\n\n{transcription}"}
            ],
        )
        print("\nStudy Guide:")
        print(response.choices[0].message.content)
        study_guide = response.choices[0].message.content
    
    #Code for if the user wants a practice test of the transcription
    elif user_choice == 3:
        count3 += 1
        if count3 == 2:
            print("This is your previous Practice Test: ")
            print(practice_test)
            continue

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI that summarizes text and creates study guides and practice tests."},
                {"role": "user", "content": f"create a practice test using this information. Make sure that the multiple choice answers are not always one choice (for example making them all B).:\n\n{transcription}"}
            ],
        )
        print("\nPractice Test:")
        print(response.choices[0].message.content)
        practice_test = response.choices[0].message.content
    elif user_choice == 0:
        print("Thank you for using StudyBuddyAI!")
        break
    else:
        print("Invalid choice. Please try again.")
    
