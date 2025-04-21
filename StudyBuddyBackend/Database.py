from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
app = Flask(__name__)
from datetime import datetime
import bcrypt
def retrieveAllFolders(mysql, AccountNum):
    """"Returns Lists of Folders and Numbers associated with Accounts in the form of a JSON like object (FolderNum, FolderName)"""
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT FolderNum, FolderName FROM Folders WHERE AccountNum = %s", (AccountNum))
        data = cursor.fetchall()
        folderFromAccounts = []
        for row in data:
            FolderNum, FolderName = row
            folderFromAccounts.append({
                "FolderName" : FolderName,
                "FolderNum": FolderNum  
            })
        return folderFromAccounts
    except Exception as err:
        
        print(f"Error fetching Folder {FolderNum}:", err)
        return None
    finally:
        if cursor.connection.open:
            cursor.close()
        if conn.open:
            conn.close()
def retrieveAllFilesInFolder(mysql, AccountNum,FolderNum):
    """Retrieves all of the Files in a Folder (Name, FileType, Num)"""
    tables = [
        'Transcription',
        'StudyGuide',
        'FlashcardSet',
        'PracticeTest',
    ]
    FileList = []
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        for table in tables:
            query = f"SELECT {table}Num, {table}Name FROM {table} WHERE AccountNum = %s AND FolderNum = %s;"
            cursor.execute(query, (AccountNum,FolderNum))
            data = cursor.fetchall()
            for row in data:
                Num, Name = row
                FileList.append({
                "Name" : Name,
                "FileType" : table,
                "Num": Num  
                })

        return FileList
    except Exception as err:
        print(f"Error printing all of Files in Folder {FolderNum}: {err}")
        return None
    finally:
        cursor.close()
        conn.close()
def retrieveFile(mysql, tableName, Num, AccountNum, FolderNum):
    """"returns the relevant display data of the file """
    match tableName:
        case "Transcription":
            return retrieveTranscription(mysql, Num, AccountNum, FolderNum)
        case "StudyGuide":
           return retrieveStudyGuide(mysql,Num,AccountNum,FolderNum)
        case "FlashcardSet":
            return retrieveFlashcardSet(mysql,Num,AccountNum,FolderNum)
        case "PracticeTest":
            return retrievePracticeTest(mysql, Num, AccountNum, FolderNum)
def combine_into_json(transcription, study_guide, practice_test, flashcards):
    """Combines all generated content into a single JSON object."""
    return {
        "message": "File uploaded and processed successfully",
        "transcription": transcription,
        "study_guide": study_guide,
        "practice_test": practice_test,
        "flashcards": flashcards
    }
def retrieveTranscription(mysql, TranscriptionNum, AccountNum, FolderNum):
    """"returns the the name and text of the transcription (transcription,name)"""
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        query = f"SELECT TranscriptionText, TranscriptionName FROM Transcription WHERE AccountNum = %s AND FolderNum = %s AND TranscriptionNum = %s;"
        cursor.execute(query, (AccountNum,FolderNum,TranscriptionNum))
        data = cursor.fetchall()
        for row in data:
            Text, Name = row
            transcirptionJson = Text

        return transcirptionJson
    except Exception as err:
        print(f"Error retrieving transcription {TranscriptionNum}: {err}")
        return None
    finally:
        cursor.close()
        conn.close()
def retrieveStudyGuide(mysql, StudyGuideNum, AccountNum, FolderNum):
    """"returns the the name and text of the Summary (summary, name)"""
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        query = f"SELECT StudyGuideText, StudyGuideName FROM StudyGuide WHERE AccountNum = %s AND FolderNum = %s AND StudyGuideNum = %s;"
        cursor.execute(query, (AccountNum,FolderNum,StudyGuideNum))
        data = cursor.fetchall()
        StudyGuideJson = ""
        for row in data:
            Text, Name = row
            StudyGuideJson = Text
        return StudyGuideJson
    except Exception as err:
        print(f"Error retrieving StudyGuide {StudyGuideNum}: {err}")
        return None
    finally:
        cursor.close()
        conn.close()
def retrievePracticeTest(mysql, PracticeTestNum, AccountNum, FolderNum):
    """"returns the the name and text of the Practice Test (summary, name)"""
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        query = f"SELECT PracticeTestName FROM PracticeTest WHERE AccountNum = %s AND FolderNum = %s AND PracticeTestNum = %s;"
        cursor.execute(query, (AccountNum,FolderNum,PracticeTestNum))
        name = cursor.fetchone()
        PracticeTestName = name
        practice_test = { 'questions': []}
        question_query = f"SELECT QuestionNum, Text, Type FROM Question WHERE PracticeTestNum = %s;"
        cursor.execute(question_query , (PracticeTestNum))
        question_data = cursor.fetchall()
        for question in question_data:
            question_Num, question_Text, question_Type = question
            question_list = {
                'question' : question_Text,
                'type' : question_Type,
            }
            if(question_Type=="true_false" or question_Type=="multiple_choice"):
                query = f"SELECT Text, Correct FROM Answer WHERE QuestionNum = %s;"
                cursor.execute(query, (question_Num))
                answer_data = cursor.fetchall()
                answer_list =[]
                correct_answer = ""
                for answer in answer_data:
                    answer_Text, Correct = answer
                    answer_list.append(answer_Text)
                    if(Correct == 1):
                        correct_answer = answer_Text
                question_list["options"] = answer_list
                question_list["correct_answer"] = correct_answer
            else:
                question_list["correct_answer"] = "Answers May Vary"
            practice_test["questions"].append(question_list)
        return practice_test
    except Exception as err:
        print(f"Error retrieving PracticeTest {PracticeTestNum}: {err}")
        return None
    finally:
        cursor.close()
        conn.close()
def retrieveFlashcardSet(mysql, FlashcardSetNum, AccountNum, FolderNum):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        query = f"SELECT FlashcardSetName FROM FlashcardSet WHERE AccountNum = %s AND FolderNum = %s AND FlashcardSetNum = %s;"
        cursor.execute(query, (AccountNum,FolderNum,FlashcardSetNum ))
        names = cursor.fetchone()
        flashcard_Array = []
        for name in names:
            FlashcardSetName = name
        query = f"SELECT FrontText, BackText From Flashcards WHERE FlashcardSetNum = %s"
        cursor.execute(query, (FlashcardSetNum))
        flashcards = cursor.fetchall()
        for flashcard in flashcards:
            fronttext, backtext = flashcard
            flashcard_data = {
                "question": fronttext,
                "answer": backtext
            }
            flashcard_Array.append(flashcard_data)
        return flashcard_Array
    except Exception as err:
        print(f"Error retrieving FlashcardSetNum {FlashcardSetNum}: {err}")
        return None
    finally:
        cursor.close()
        conn.close()
def createAccount(cursor, conn, Email, Username, Password, Joindate=None):
    """Creates a an account in the SQL database"""
    try:
        # If Joindate is not provided, use the current date
        if Joindate is None:
            Joindate = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Encode Joindate to bytes and generate a salt
        salt = bcrypt.gensalt()
        joindate_bytes = Joindate.encode('utf-8')
        
        # Combine password with Joindate before hashing
        combined_password = Password.encode('utf-8') + joindate_bytes
        hashed_password = bcrypt.hashpw(combined_password, salt)

        # SQL query to insert a new account
        cursor.execute("INSERT INTO Accounts (Email, Username, Password, Joindate) VALUES (%s, %s, %s, %s)", 
                       (Email, Username, hashed_password , Joindate))
        # Commit the transaction
        conn.commit()
        return cursor.lastrowid  # Return the generated AccountNum
    
    except Exception as err:
        print("Error:", err)
def readAccount(cursor, AccountNum):
    """Reads an account from the database given it's unique Identifying number"""
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
        return folder_num
    except Exception as err:
        print("Error:", err)
        return "null"
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

def createTranscription(cursor, conn, TranscriptionName, TranscriptionText, AccountNum, FolderNum="null"):
    try:
        
        # Check if AccountNum exists
        cursor.execute("SELECT COUNT(*) FROM Accounts WHERE AccountNum = %s", (AccountNum,))
        account_exists = cursor.fetchone()[0] > 0
        
        if not account_exists:
            print(f"Error: AccountNum {AccountNum} does not exist.")
            return None
        cursor.execute("INSERT INTO Transcription (TranscriptionName, TranscriptionText, AccountNum, FolderNum) VALUES (%s, %s, %s,%s)", (TranscriptionName, TranscriptionText, AccountNum, FolderNum))
        conn.commit()
        transcription_num = cursor.lastrowid
        return transcription_num
    except Exception as err:
        print("Error:", err)
        return "null"
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


def createPracticeTest(cursor, conn, PracticeTestName, AccountNum, TranscriptionNum, FolderNum="null"):
    try:
        cursor.execute("INSERT INTO PracticeTest (PracticeTestName, AccountNum, TranscriptionNum, FolderNum) VALUES (%s, %s, %s, %s)",
                       (PracticeTestName, AccountNum, TranscriptionNum, FolderNum))
        conn.commit()
        test_num = cursor.lastrowid
        return test_num
    except Exception as err:
        print("Error:", err)
        return "null"

def readPracticeTest(cursor, TestNum):
    try:
        cursor.execute("SELECT * FROM PracticeTest WHERE PracticeTestNum = %s", (TestNum,))
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
        cursor.execute(f"UPDATE PracticeTest SET {column} = %s WHERE PracticeTestNum = %s", (value, TestNum))
        conn.commit()
        print(f"PracticeTest with TestNum {TestNum} updated successfully.")
    except Exception as e:
        print(f"Error updating PracticeTest: {e}")
def deletePracticeTest(cursor, conn, TestNum):
    try:
        cursor.execute("DELETE FROM PracticeTest WHERE PracticeTestNum = %s", (TestNum,))
        conn.commit()
        print(f"PracticeTest with PracticeTestNum {TestNum} deleted successfully.")
    except Exception as e:
        print(f"Error deleting PracticeTest: {e}")


def createStudyGuide(cursor, conn, StudyGuideName, StudyGuideText, AccountNum, TranscriptionNum, FolderNum):
    try:
        cursor.execute("INSERT INTO StudyGuide (StudyGuideName, StudyGuideText, AccountNum, TranscriptionNum, FolderNum) VALUES (%s, %s, %s, %s, %s)",
                       (StudyGuideName, StudyGuideText, AccountNum, TranscriptionNum, FolderNum))
        conn.commit()
        study_guide_num = cursor.lastrowid
        return study_guide_num
    except Exception as err:
        print("Error:", err)
        return "null"
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


def createFlashcardSet(cursor, conn, setName, AccountNum, TranscriptionNum, FolderNum="null"):
    try:
        cursor.execute("INSERT INTO FlashcardSet (FlashcardSetName, AccountNum, TranscriptionNum, FolderNum) VALUES (%s, %s,%s, %s)", (setName, AccountNum, TranscriptionNum, FolderNum))
        conn.commit()
        flashcardset_num = cursor.lastrowid
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
        cursor.execute("SELECT COUNT(*) FROM FlashcardSet WHERE FlashcardSetNum = %s", (str(FlashcardSetNum)))
        flashcardset_exists = cursor.fetchone()[0] > 0
        if not flashcardset_exists:
            print(f"Error: FlashcardSetNum {FlashcardSetNum} does not exist.")
            return None

        # Insert new Flashcard into Flashcards table
        cursor.execute("INSERT INTO Flashcards (FrontText, BackText, FlashcardSetNum) VALUES (%s, %s, %s)",
                       (FrontText, BackText, FlashcardSetNum))
        conn.commit()  # Commit the transaction
        flashcard_num = cursor.lastrowid  # Get the last inserted ID for the flashcard
        return flashcard_num
    except Exception as err:
        print("Error:", err)
        conn.rollback()  # Rollback in case of an error
        return "null"

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


def createQuestion(cursor, conn, Type, Text, TestNum, TranscriptionNum):
    try:

        cursor.execute("INSERT INTO Question (Type, Text, PracticeTestNum, TranscriptionNum) VALUES (%s, %s, %s,%s)",
                       (Type, Text, TestNum, TranscriptionNum))
        conn.commit()
        question_num = cursor.lastrowid
        return question_num
    except Exception as err:
        print("Error:", err)
        return "null"

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
        cursor.execute("INSERT INTO Answer (Text, QuestionNum, Correct) VALUES (%s, %s, %s)", (Text, str(QuestionNum), Correct))
        conn.commit()
        answer_num = cursor.lastrowid
        return answer_num
    except Exception as err:
        print("Error:", err)
        return "null"
def readAnswer(cursor, AnswerNum):
    try:
        cursor.execute("SELECT * FROM Answer WHERE AnswerNum = %s", (str(AnswerNum)))
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
def read_database(mysql):
    """Reads everything from the database"""
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
        conn = mysql.connect()
        cursor = conn.cursor()
        for table in tables:
            print(f"Reading {table} from database")
            try:
                cursor.execute(f"SELECT * FROM {table};")
                data = cursor.fetchall()
                for row in data:
                    print(row)
            except Exception as err:
                print(f"Error printing all of {table}: {err}")
    except Exception as err:
        print(f"Error reading database: {err}")
def reset_database(mysql):
    """Deletes everything from the database"""
    
    tables = [
            'Flashcards',
            'StudyGuide',
            'FlashcardSet',
            'Question',
            'Answer',
            'PracticeTest',
            'Transcription',
            'Folders',
            #'Accounts'
        ]
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        conn.commit()
        for table in tables:
            delete_sql = f"DELETE FROM {table};"
            cursor.execute(delete_sql)
            conn.commit()
            print(f"All records deleted from {table}")
        print("Database has been reset successfully.")
    except Exception as err:
        print(f"Error: {err}")
        # Loop through the tables and delete the data from each one
    finally:
        cursor.close()
        conn.close()
def verifyPassword(cursor, Email, password):
    try:
        # Retrieve account details
        cursor.execute("SELECT AccountNum, Password, Joindate FROM Accounts WHERE Email = %s", (Email,))
        data = cursor.fetchone()  # Using fetchone since Email should be unique
        
        if data:
            accountNum, stored_hashed_password, joindate = data
            
            # Encode Joindate and combine with user-provided password
            joindate_bytes = joindate.encode('utf-8')
            combined_password = password.encode('utf-8') + joindate_bytes
            
            # Verify password using bcrypt
            if bcrypt.checkpw(combined_password, stored_hashed_password.encode('utf-8')): 
                return True, accountNum
        
        return False, None

    except Exception as err:
        print("Error verifying password:", err)
        return False, None

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
    TranscriptionNum = createTranscription(cursor, conn, 'Test Transcription', 'This is the transcription text', AccountNum, FolderNum)
    print(f"Created TranscriptionNum: {TranscriptionNum}")

    # CREATE PRACTICE TEST (Linked to Transcription, Folder, Account)
    print("Creating Practice Test...")
    PracticeTestNum = createPracticeTest(cursor, conn, 'Test Practice', AccountNum, TranscriptionNum, FolderNum)
    print(f"Created PracticeTestNum: {PracticeTestNum}")

    # CREATE QUESTION (Linked to the Practice Test)
    print("Creating Question...")
    #QuestionNum = createQuestion(cursor, conn, "", 'What is 2 + 2?', PracticeTestNum, TranscriptionNum)
    #print(f"Created QuestionNum: {QuestionNum}")

    # CREATE ANSWER (Linked to the Question)
    print("Creating Answer...")
    #AnswerNum = createAnswer(cursor, conn, '4', QuestionNum, 1)  # 1 for Correct Answer
    #print(f"Created AnswerNum: {AnswerNum}")

    # CREATE FLASHCARD SET (Linked to Transcription, Folder, Account)
    print("Creating Flashcard Set...")
    FlashcardSetNum = createFlashcardSet(cursor, conn, 'Test Flashcard Set',  AccountNum, TranscriptionNum, FolderNum)
    print(f"Created FlashcardSetNum: {FlashcardSetNum}")

    # CREATE FLASHCARDS (Linked to Flashcard Set)
    print("Creating Flashcards...")
    FlashcardNum1 = createFlashcard(cursor, conn, 'Front of Card 1', 'Back of Card 1', FlashcardSetNum)
    FlashcardNum2 = createFlashcard(cursor, conn, 'Front of Card 2', 'Back of Card 2', FlashcardSetNum)
    print(f"Created Flashcards with FlashcardNum1: {FlashcardNum1} and FlashcardNum2: {FlashcardNum2}")

    # CREATE STUDY GUIDE (Linked to Folder, Account, and Transcription)
    print("Creating Study Guide...")
    StudyGuideNum = createStudyGuide(cursor, conn, "Study Guide Name",'This is the Study Guide text.', AccountNum, TranscriptionNum, FolderNum)
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
    #readQuestion(cursor, QuestionNum)

    print("Reading one Answer...")
    #readAnswer(cursor, AnswerNum)

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
    #deleteAnswer(cursor, conn, AnswerNum)

    print("Deleting Question...")
    #deleteQuestion(cursor, conn, QuestionNum)

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

