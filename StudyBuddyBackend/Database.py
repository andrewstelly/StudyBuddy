from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
app = Flask(__name__)
from datetime import datetime

def createAccount(cursor, conn, Email, Username, Password, Joindate=None):
    try:
        # If Joindate is not provided, use the current date
        if Joindate is None:
            Joindate = datetime.now().strftime('%Y-%m-%d %H:%M:%S')


        # SQL query to insert a new account
        cursor.execute("INSERT INTO Accounts (Email, Username, Password, Joindate) VALUES (%s, %s, %s, %s)", 
                       (Email, Username, Password, Joindate))
        # Commit the transaction
        conn.commit()
        print("Account created successfully with AccountNum:", cursor.lastrowid)
        return cursor.lastrowid  # Return the generated AccountNum
    
    except Exception as err:
        print("Error:", err)
def readAccount(cursor, AccountNum):
    try:
        cursor.execute("SELECT * FROM Accounts WHERE AccountNum = %s", (AccountNum,))
        data = cursor.fetchall()
        for row in data:
            print(row)
    except Exception as err:
        print("Error fetching Account:", err)

def readAllAccounts(cursor):
    try:
        cursor.execute("SELECT * FROM Accounts")
        data = cursor.fetchall()
        for row in data:
            print(row)
    except Exception as err:
        print("Error fetching Accounts:", err)
def updateAccount(cursor, conn, AccountNum, column, value):
    try:
        cursor.execute(f"UPDATE Accounts SET {column} = %s WHERE AccountNum = %s", (value, AccountNum))
        conn.commit()
        print(f"Account with AccountNum {AccountNum} updated successfully.")
    except Exception as e:
        print(f"Error updating Account with AccountNum {AccountNum}: {e}")
def deleteAccount(cursor, conn, AccountNum):
    try:
        cursor.execute("DELETE FROM Accounts WHERE AccountNum = %s", (AccountNum,))
        conn.commit()
        print(f"Account with AccountNum {AccountNum} deleted successfully.")
    except Exception as e:
        print(f"Error deleting Account with AccountNum {AccountNum}: {e}")

def createFolder(cursor, conn, FolderName, AccountNum):
    try:
        cursor.execute("INSERT INTO Folders (FolderName, AccountNum) VALUES (%s, %s)", (FolderName, AccountNum))
        conn.commit()
        folder_num = cursor.lastrowid
        print(f"Folder created successfully with FolderNum: {folder_num}")
        return folder_num
    except Exception as err:
        print("Error:", err)
        return None
def readFolder(cursor, FolderNum):
    try:
        cursor.execute("SELECT * FROM Folders WHERE FolderNum = %s", (FolderNum,))
        data = cursor.fetchall()
        for row in data:
            print(row)
    except Exception as err:
        print("Error fetching Folder:", err)
def readAllFolders(cursor):
    try:
        cursor.execute("SELECT * FROM Folders")
        data = cursor.fetchall()
        for row in data:
            print(row)
    except Exception as err:
        print("Error fetching Folders:", err)
def updateFolder(cursor, conn, FolderNum, column, value):
    try:
        cursor.execute(f"UPDATE Folders SET {column} = %s WHERE FolderNum = %s", (value, FolderNum))
        conn.commit()
        print(f"Folders with FolderNum {FolderNum} updated successfully.")
    except Exception as e:
        print(f"Error updating Folder with FolderNum {FolderNum}: {e}")
def deleteFolder(cursor, conn, FolderNum):
    try:
        cursor.execute("DELETE FROM Folders WHERE FolderNum = %s", (FolderNum,))
        conn.commit()
        print(f"Folder with FolderNum {FolderNum} deleted successfully.")
    except Exception as e:
        print(f"Error deleting Folder with FolderNum {FolderNum}: {e}")

def createTranscription(cursor, conn, TranscriptionName, TranscriptionText, FolderNum, AccountNum):
    
    try:
         # Check if FolderNum exists
        cursor.execute("SELECT COUNT(*) FROM Folders WHERE FolderNum = %s", (FolderNum,))
        folder_exists = cursor.fetchone()[0] > 0
        
        # Check if AccountNum exists
        cursor.execute("SELECT COUNT(*) FROM Accounts WHERE AccountNum = %s", (AccountNum,))
        account_exists = cursor.fetchone()[0] > 0
        
        if not folder_exists:
            print(f"Error: FolderNum {FolderNum} does not exist.")
            return None
        if not account_exists:
            print(f"Error: AccountNum {AccountNum} does not exist.")
            return None
        cursor.execute("INSERT INTO Transcription (TranscriptionName, TranscriptionText, FolderNum, AccountNum) VALUES (%s, %s, %s,%s)", (TranscriptionName, TranscriptionText, FolderNum, AccountNum))
        conn.commit()
        transcription_num = cursor.lastrowid
        print(f"Transcription created successfully with TranscriptionNum: {transcription_num}")
        return transcription_num
    except Exception as err:
        print("Error:", err)
        return None
def readTranscription(cursor, TranscriptionNum):
    try:

        cursor.execute("SELECT * FROM Transcription WHERE TranscriptionNum = %s", (TranscriptionNum,))
        data = cursor.fetchall()
        print("Reading Transcription with TranscriptionNum:", TranscriptionNum)
        for row in data:
            print(row)
    except Exception as e:
        print("Error reading Transcription:", e)

def readAllTranscriptions(cursor):
    try:
        cursor.execute("SELECT * FROM Transcription")
        data = cursor.fetchall()
        print("Printing all Transcriptions:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching Transcriptions: {e}")
def updateTranscription(cursor, conn, TranscriptionNum, column, value):
    try:
        cursor.execute(f"UPDATE Transcription SET {column} = %s WHERE TranscriptionNum = %s", (value, TranscriptionNum))
        conn.commit()
        print(f"Transcription with TranscriptionNum {TranscriptionNum} updated successfully.")
    except Exception as e:
        print(f"Error updating Transcription with TranscriptionNum {TranscriptionNum}: {e}")
def deleteTranscription(cursor, conn, TranscriptionNum):
    try:
        cursor.execute("DELETE FROM Transcription WHERE TranscriptionNum = %s", (TranscriptionNum,))
        conn.commit()
        print(f"Transcription with TranscriptionNum {TranscriptionNum} deleted successfully.")
    except Exception as e:
        print(f"Error deleting Transcription with TranscriptionNum {TranscriptionNum}: {e}")


def createPracticeTest(cursor, conn, PracticeTestName, TranscriptionNum, FolderNum, AccountNum):
    try:
        cursor.execute("INSERT INTO PracticeTest (PracticeTestName, TranscriptionNum, FolderNum, AccountNum) VALUES (%s, %s, %s, %s)",
                       (PracticeTestName, TranscriptionNum, FolderNum, AccountNum))
        conn.commit()
        test_num = cursor.lastrowid
        print(f"PracticeTest created successfully with TestNum: {test_num}")
        return test_num
    except Exception as err:
        print("Error:", err)
        return None

def readPracticeTest(cursor, TestNum):
    try:
        cursor.execute("SELECT * FROM PracticeTest WHERE TestNum = %s", (TestNum,))
        data = cursor.fetchall()
        print("Printing PracticeTest:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching PracticeTest: {e}")
def readAllPracticeTests(cursor):
    try:
        cursor.execute("SELECT * FROM PracticeTest")
        data = cursor.fetchall()
        print("Printing all PracticeTests:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching PracticeTests: {e}")

def updatePracticeTest(cursor, conn, TestNum, column, value):
    try:
        cursor.execute(f"UPDATE PracticeTest SET {column} = %s WHERE TestNum = %s", (value, TestNum))
        conn.commit()
        print(f"PracticeTest with TestNum {TestNum} updated successfully.")
    except Exception as e:
        print(f"Error updating PracticeTest: {e}")
def deletePracticeTest(cursor, conn, TestNum):
    try:
        cursor.execute("DELETE FROM PracticeTest WHERE TestNum = %s", (TestNum,))
        conn.commit()
        print(f"PracticeTest with TestNum {TestNum} deleted successfully.")
    except Exception as e:
        print(f"Error deleting PracticeTest: {e}")


def createStudyGuide(cursor, conn, StudyGuideText, FolderNum, AccountNum, TranscriptionNum):
    try:
        cursor.execute("INSERT INTO StudyGuide (StudyGuideText, FolderNum, AccountNum, TranscriptionNum) VALUES (%s, %s, %s, %s)",
                       (StudyGuideText, FolderNum, AccountNum, TranscriptionNum))
        conn.commit()
        study_guide_num = cursor.lastrowid
        print(f"StudyGuide created successfully with StudyGuideNum: {study_guide_num}")
        return study_guide_num
    except Exception as err:
        print("Error:", err)
        return None
def readStudyGuide(cursor, StudyGuideNum):
    try:
        cursor.execute("SELECT * FROM StudyGuide WHERE StudyGuideNum = %s", (StudyGuideNum,))
        data = cursor.fetchall()
        print("Printing StudyGuide:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching StudyGuide: {e}")
def readAllStudyGuides(cursor):
    try:
        cursor.execute("SELECT * FROM StudyGuide")
        data = cursor.fetchall()
        print("Printing all StudyGuides:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching StudyGuides: {e}")

def updateStudyGuide(cursor, conn, StudyGuideNum, column, value):
    try:
        cursor.execute(f"UPDATE StudyGuide SET {column} = %s WHERE StudyGuideNum = %s", (value, StudyGuideNum))
        conn.commit()
        print(f"StudyGuide with StudyGuideNum {StudyGuideNum} updated successfully.")
    except Exception as e:
        print(f"Error updating StudyGuide: {e}")

def deleteStudyGuide(cursor, conn, StudyGuideNum):
    try:
        cursor.execute("DELETE FROM StudyGuide WHERE StudyGuideNum = %s", (StudyGuideNum,))
        conn.commit()
        print(f"StudyGuide with StudyGuideNum {StudyGuideNum} deleted successfully.")
    except Exception as e:
        print(f"Error deleting StudyGuide: {e}")


def createFlashcardSet(cursor, conn, setName, TranscriptionNum, FolderNum, AccountNum):
    try:
        
        cursor.execute("INSERT INTO FlashcardSet (SetName, TranscriptionNum, FolderNum, AccountNum) VALUES (%s, %s,%s, %s)", (setName, TranscriptionNum, FolderNum, AccountNum))
        conn.commit()
        flashcardset_num = cursor.lastrowid
        print(f"FlashcardSet created successfully with FlashcardSet: {flashcardset_num}")
        return flashcardset_num
    
    except Exception as err:
        return f"Error creating flashcard set: {err}"
def readFlashcardSet(cursor, folderNum):
    try:
        
        cursor.execute("SELECT * FROM FlashcardSet WHERE FlashcardSetNum = %s", (folderNum,))
        data = cursor.fetchall()
        print("Printing all Flashcard:")
        for row in data:
            print(row)

    except Exception as e:
        return f"Error fetching flashcard sets: {e}"
    
def readAllFlashcardSet(cursor):
    try:

        cursor.execute("SELECT * FROM FlashcardSet")
        data = cursor.fetchall()
        print("Printing all Flashcards:")
        for row in data:
            print(row)

    except Exception as e:
        return f"Error fetching flashcard sets: {e}"
    
def updateFlashcardSet(cursor, conn, setNum, column, value):
    try:        
        query = "UPDATE FlashcardSet SET {} = %s WHERE SetNum = %s".format(column)
        cursor.execute(query, (value, setNum))
        
        conn.commit()
        return "Flashcard Set Updated Successfully"

    except Exception as e:
        return f"Error updating flashcard set: {e}"
def deleteFlashcardSet(cursor, conn, setNum):
    try:
        cursor.execute("DELETE FROM FlashcardSet WHERE SetNum = %s", (setNum,))
        conn.commit()
        return "Flashcard Set Deleted Successfully"

    except Exception as e:
        return f"Error deleting flashcard set: {e}"
    

def createFlashcard(cursor, conn, FrontText, BackText, FlashcardSetNum):
    try:
        # Check if FlashcardSetNum exists
        cursor.execute("SELECT COUNT(*) FROM FlashcardSet WHERE FlashcardSetNum = %s", (FlashcardSetNum,))
        flashcardset_exists = cursor.fetchone()[0] > 0
        if not flashcardset_exists:
            print(f"Error: FlashcardSetNum {FlashcardSetNum} does not exist.")
            return None

        # Insert new Flashcard into Flashcards table
        cursor.execute("INSERT INTO Flashcards (FrontText, BackText, FlashcardSetNum) VALUES (%s, %s, %s)",
                       (FrontText, BackText, FlashcardSetNum))
        conn.commit()  # Commit the transaction
        flashcard_num = cursor.lastrowid  # Get the last inserted ID for the flashcard
        print(f"Flashcard created successfully with FlashcardNum: {flashcard_num}")
        return flashcard_num
    except Exception as err:
        print("Error:", err)
        conn.rollback()  # Rollback in case of an error
        return None

def readFlashcard(cursor, FlashcardNum):
    try:
        cursor.execute("SELECT * FROM Flashcards WHERE FlashcardNum = %s", (FlashcardNum,))
        data = cursor.fetchall()
        print("Printing Flashcard:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching Flashcard: {e}")

def readAllFlashcards(cursor):
    try:
        cursor.execute("SELECT * FROM Flashcards")
        data = cursor.fetchall()
        print("Printing all Flashcards:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching Flashcards: {e}")
def updateFlashcard(cursor, conn, FlashcardNum, column, value):
    try:
        # Ensure column is a valid field in the Flashcards table to avoid SQL injection
        valid_columns = ["FrontText", "BackText", "FlashcardSetNum"]  # Add valid column names here
        if column not in valid_columns:
            print(f"Error: Invalid column name '{column}'.")
            return None

        # Construct the SQL query with a safe column name
        query = f"UPDATE Flashcards SET {column} = %s WHERE FlashcardNum = %s"
        cursor.execute(query, (value, FlashcardNum))
        conn.commit()
        print(f"Flashcard with FlashcardNum {FlashcardNum} updated successfully.")
    except Exception as e:
        print(f"Error updating Flashcard: {e}")
        conn.rollback()  # Rollback in case of error


def deleteFlashcard(cursor, conn, FlashcardNum):
    try:
        cursor.execute("DELETE FROM Flashcards WHERE FlashcardNum = %s", (FlashcardNum,))
        conn.commit()
    except Exception as e:
        print("Error deleting Flashcard:", e)


def createQuestion(cursor, conn, Text, TestNum, TranscriptionNum):
    try:

        cursor.execute("INSERT INTO Question (Text, TestNum, TranscriptionNum) VALUES (%s, %s, %s)",
                       (Text, TestNum, TranscriptionNum))
        conn.commit()
        question_num = cursor.lastrowid
        print(f"Question created successfully with QuestionNum: {question_num}")
        return question_num
    except Exception as err:
        print("Error:", err)
        return None

def readQuestion(cursor, QuestionNum):
    try:
        cursor.execute("SELECT * FROM Question WHERE QuestionNum = %s", (QuestionNum,))
        data = cursor.fetchall()
        print("Printing Question:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching Question: {e}")

def readAllQuestions(cursor):
    try:
        cursor.execute("SELECT * FROM Question")
        data = cursor.fetchall()
        print("Printing all Questions:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching Questions: {e}")

def updateQuestion(cursor, conn, QuestionNum, column, value):
    try:
        cursor.execute(f"UPDATE Question SET {column} = %s WHERE QuestionNum = %s", (value, QuestionNum))
        conn.commit()
        print(f"Question with QuestionNum {QuestionNum} updated successfully.")
    except Exception as e:
        print(f"Error updating Question: {e}")

def deleteQuestion(cursor, conn, QuestionNum):
    try:
        cursor.execute("DELETE FROM Question WHERE QuestionNum = %s", (QuestionNum,))
        conn.commit()
    except Exception as e:
        print("Error deleting Question:", e)

def createAnswer(cursor, conn, Text, QuestionNum, Correct):
    try:
        cursor.execute("INSERT INTO Answer (Text, QuestionNum, Correct) VALUES (%s, %s, %s)", (Text, QuestionNum, Correct))
        conn.commit()
        answer_num = cursor.lastrowid
        print(f"Answer created successfully with AnswerNum: {answer_num}")
        return answer_num
    except Exception as err:
        print("Error:", err)
        return None
def readAnswer(cursor, AnswerNum):
    try:
        cursor.execute("SELECT * FROM Answer WHERE AnswerNum = %s", (AnswerNum,))
        data = cursor.fetchall()
        print("Printing Answer:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching Answer: {e}")
def readAllAnswers(cursor):
    try:
        cursor.execute("SELECT * FROM Answer")
        data = cursor.fetchall()
        print("Printing all Answers:")
        for row in data:
            print(row)
    except Exception as e:
        print(f"Error fetching Answers: {e}")
def updateAnswer(cursor, conn, AnswerNum, column, value):
    try:
        cursor.execute(f"UPDATE Answer SET {column} = %s WHERE AnswerNum = %s", (value, AnswerNum))
        conn.commit()
        print(f"Answer with AnswerNum {AnswerNum} updated successfully.")
    except Exception as e:
        print(f"Error updating Answer: {e}")

def deleteAnswer(cursor, conn, AnswerNum):
    try:
        cursor.execute("DELETE FROM Answer WHERE AnswerNum = %s", (AnswerNum,))
        conn.commit()
    except Exception as e:
        print("Error deleting Answer:", e)

def reset_database(cursor,conn):
    tables = [
            'Transcription',
            'Flashcards',
            'StudyGuide',
            'FlashcardSet',
            'Question',
            'Answer',
            'PracticeTest',
            'Folders',
            'Accounts'
        ]
    try:
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        conn.commit()
        
 
        print("Database has been reset successfully.")
    except Exception as err:
        print(f"Error: {err}")
        # Loop through the tables and delete the data from each one
    for table in tables:
        try:
            delete_sql = f"DELETE FROM {table};"
            cursor.execute(delete_sql)
            conn.commit()
            print(f"All records deleted from {table}")
        except Exception as err:
            print(f"Error deleting from {table}: {err}")
def verifyPassword(cursor, Email, password):
    try:
        cursor.execute("SELECT AccountNum, Password, Joindate FROM Accounts WHERE Email = %s", (Email))
        data = cursor.fetchall()

        for row in data:
            accountNum = row[0]
            accountPassword = row[1]
            salt = row[2]
            if(str(password) == accountPassword):
                return True, accountNum
        return False
    except Exception as err:
        print("Error fetching Account:", err)

def test_create_update_read_delete(cursor, conn):
    # CREATE ACCOUNT
    print("Creating Account...")
    AccountNum = createAccount(cursor, conn, 'test@example.com', 'testUser', 'securePassword', '2025-03-27')
    print(f"Created AccountNum: {AccountNum}")

    # CREATE FOLDER (Linked to the Account)
    print("Creating Folder...")
    FolderNum = createFolder(cursor, conn, 'Test Folder', AccountNum)
    print(f"Created FolderNum: {FolderNum}")

    # CREATE TRANSCRIPTION (Linked to the Folder and Account)
    print("Creating Transcription...")
    TranscriptionNum = createTranscription(cursor, conn, 'Test Transcription', 'This is the transcription text', FolderNum,AccountNum)
    print(f"Created TranscriptionNum: {TranscriptionNum}")

    # CREATE PRACTICE TEST (Linked to Transcription, Folder, Account)
    print("Creating Practice Test...")
    PracticeTestNum = createPracticeTest(cursor, conn, 'Test Practice', TranscriptionNum, FolderNum, AccountNum)
    print(f"Created PracticeTestNum: {PracticeTestNum}")

    # CREATE QUESTION (Linked to the Practice Test)
    print("Creating Question...")
    QuestionNum = createQuestion(cursor, conn, 'What is 2 + 2?', PracticeTestNum, TranscriptionNum)
    print(f"Created QuestionNum: {QuestionNum}")

    # CREATE ANSWER (Linked to the Question)
    print("Creating Answer...")
    AnswerNum = createAnswer(cursor, conn, '4', QuestionNum, 1)  # 1 for Correct Answer
    print(f"Created AnswerNum: {AnswerNum}")

    # CREATE FLASHCARD SET (Linked to Transcription, Folder, Account)
    print("Creating Flashcard Set...")
    FlashcardSetNum = createFlashcardSet(cursor, conn, 'Test Flashcard Set', TranscriptionNum, FolderNum, AccountNum)
    print(f"Created FlashcardSetNum: {FlashcardSetNum}")

    # CREATE FLASHCARDS (Linked to Flashcard Set)
    print("Creating Flashcards...")
    FlashcardNum1 = createFlashcard(cursor, conn, 'Front of Card 1', 'Back of Card 1', FlashcardSetNum)
    FlashcardNum2 = createFlashcard(cursor, conn, 'Front of Card 2', 'Back of Card 2', FlashcardSetNum)
    print(f"Created Flashcards with FlashcardNum1: {FlashcardNum1} and FlashcardNum2: {FlashcardNum2}")

    # CREATE STUDY GUIDE (Linked to Folder, Account, and Transcription)
    print("Creating Study Guide...")
    StudyGuideNum = createStudyGuide(cursor, conn, 'This is the Study Guide text.', FolderNum, AccountNum, TranscriptionNum)
    print(f"Created StudyGuideNum: {StudyGuideNum}")

    # READ ALL CREATED ITEMS
    print("Reading all created Accounts...")
    readAllAccounts(cursor)

    print("Reading all created Folders...")
    readAllFolders(cursor)

    print("Reading all created Transcriptions...")
    readAllTranscriptions(cursor)

    print("Reading all created Practice Tests...")
    readAllPracticeTests(cursor)

    print("Reading all created Questions...")
    readAllQuestions(cursor)

    print("Reading all created Answers...")
    readAllAnswers(cursor)

    print("Reading all created Flashcard Sets...")
    readAllFlashcardSet(cursor)

    print("Reading all created Flashcards...")
    readAllFlashcards(cursor)

    print("Reading all created Study Guides...")
    readAllStudyGuides(cursor)

    # READ ONE ITEM (e.g., by primary key)
    print("Reading one Account...")
    readAccount(cursor, AccountNum)

    print("Reading one Folder...")
    readFolder(cursor, FolderNum)

    print("Reading one Transcription...")
    readTranscription(cursor, TranscriptionNum)

    print("Reading one Practice Test...")
    readPracticeTest(cursor, PracticeTestNum)

    print("Reading one Question...")
    readQuestion(cursor, QuestionNum)

    print("Reading one Answer...")
    readAnswer(cursor, AnswerNum)

    print("Reading one Flashcard Set...")
    readFlashcardSet(cursor, FlashcardSetNum)

    print("Reading one Flashcard...")
    readFlashcard(cursor,  FlashcardNum1)

    print("Reading one Study Guide...")
    readStudyGuide(cursor, StudyGuideNum)

    # UPDATE PRACTICE TEST
    new_practice_test_name = 'Updated Practice Test'
    print(f"Updating Practice Test with TestNum {PracticeTestNum}...")
    updatePracticeTest(cursor, conn, PracticeTestNum, 'PracticeTestName', new_practice_test_name)

    # UPDATE FLASHCARD
    new_flashcard_front = 'Updated Front of Card 1'
    print(f"Updating Flashcard with FlashcardNum {FlashcardNum1}...")
    updateFlashcard(cursor, conn, FlashcardNum1, 'FrontText', new_flashcard_front)

    # DELETE created items in reverse order (to maintain foreign key constraints)
    print("Deleting Flashcards...")
    deleteFlashcard(cursor, conn, FlashcardNum1)
    deleteFlashcard(cursor, conn, FlashcardNum2)

    print("Deleting Flashcard Set...")
    deleteFlashcardSet(cursor, conn, FlashcardSetNum)

    print("Deleting Answer...")
    deleteAnswer(cursor, conn, AnswerNum)

    print("Deleting Question...")
    deleteQuestion(cursor, conn, QuestionNum)

    print("Deleting Practice Test...")
    deletePracticeTest(cursor, conn, PracticeTestNum)

    print("Deleting Study Guide...")
    deleteStudyGuide(cursor, conn, StudyGuideNum)

    print("Deleting Transcription...")
    deleteTranscription(cursor, conn, TranscriptionNum)

    print("Deleting Folder...")
    deleteFolder(cursor, conn, FolderNum)

    print("Deleting Account...")
    deleteAccount(cursor, conn, AccountNum)

    print("Test completed: Created, Updated, Read, and Deleted everything.")

