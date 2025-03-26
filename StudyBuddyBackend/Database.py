import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
app = Flask(__name__)
from datetime import datetime

def createAccount(mysql, email, username, password):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()

        # Execute the INSERT query with parameterized values
        cursor.execute(
            "INSERT INTO Accounts (Email, Username, Password, Joindate) VALUES (%s, %s, %s, %s)",
            (email, username, password, datetime.today().strftime('%Y-%m-%d'))
        )

        # Commit the transaction to save changes
        conn.commit()
        print("Accounts Created")
    except Exception as e:
        print("Error creating account:", e)

    finally:
        # Ensure proper cleanup
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def readAllAccount(mysql):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Accounts")
        data = cursor.fetchall()
        print("printing all acounts")
        for row in data:
            print(row)
    except Exception as e:
        print("Error fetching accounts:", e)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def updateAccount(mysql,userName ,column, value):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        if("password" == column or column == "Password"):
            #cursor.execute("SELECT Joindate FROM Accounts WHERE " + (userName) +" == Username;")
            #data = cursor.fetchall()
            #for row in data:
            #    joinDate = row
            #print(joinDate)
            cursor.execute("UPDATE Account SET Password = " + str(value) + " WHERE " + (userName) +" == Username;")
        else:
            cursor.execute("UPDATE Account SET "+str(column)+" = " + str(value) + " WHERE " + (userName) +" == Username;") 
        conn.close()
    except Exception as e:
        print("Error deleting account:", e)
def deleteAccount(mysql,username):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Accounts WHERE Username = %s", (username))
        conn.commit()
    except Exception as e:
        print("Error deleting account:", e)
    finally:
        # Ensure resources are closed properly
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def createFolder(mysql,folder_name, account_num):
    try:
        # Establish the database connection
        conn = mysql.connect()
        cursor = conn.cursor()

        # SQL query to insert a new folder
        cursor.execute("INSERT INTO Folders (FolderName, AccountNum) VALUES (%s, %s)", (folder_name, account_num))
        
        # Commit the transaction
        conn.commit()
        
        print("Folder created successfully with FolderNum:", cursor.lastrowid)
    
    except Exception as err:
        print("Error:", err)
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def readFolder(mysql,accountNum):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Folders WHERE AccountNum = %s", accountNum)
        data = cursor.fetchall()
        print("printing all folders")
        for row in data:
            print(row)
    except Exception as e:
        print("Error fetching accounts:", e)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def readAllFolders(mysql):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Folders")
        data = cursor.fetchall()
        print("printing all folders")
        for row in data:
            print(row)
    except Exception as e:
        print("Error fetching accounts:", e)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def updateFolder(mysql, FolderNum, column, value):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("UPDATE Account SET "+str(column)+" = " + str(value) + " WHERE " + (FolderNum) +" == FolderNum;") 
        conn.close()
    except Exception as e:
        print("Error deleting account:", e)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def deleteFolder(mysql, FolderNum):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Accounts WHERE Username = %s", (FolderNum))
        conn.commit()
    except Exception as e:
        print("Error deleting account:", e)
    finally:
        # Ensure resources are closed properly
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def createTranscription(mysql, TranscriptionName,TranscriptionText,AccountNum,FolderNum):
    try:
        # Establish the database connection
        conn = mysql.connect()
        cursor = conn.cursor()

        # SQL query to insert a new folder
        cursor.execute("INSERT INTO Folders (TranscriptionName,TranscriptionText,AccountNum,FolderNum) VALUES (%s,%s,%s,%s)", (TranscriptionName,TranscriptionText,AccountNum,FolderNum))
        # Commit the transaction
        conn.commit()
        print("Folder created successfully with FolderNum:", cursor.lastrowid)
    
    except Exception as err:
        print("Error:", err)
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
def readTranscription(mysql,TranscriptionNum):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Folders WHERE TranscriptionNum= %s", TranscriptionNum)
        data = cursor.fetchall()
        print("printing Transcription")
        for row in data:
            print(row)
    except Exception as e:
        print("Error fetching Transcriptions:", e)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def updateTranscription(mysql,TranscriptionNum,column, value ):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("UPDATE Account SET "+str(column)+" = " + str(value) + " WHERE " + (TranscriptionNum) +" == TranscriptionNum;") 
        conn.close()
    except Exception as e:
        print("Error deleting account:", e)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
def deleteTranscription(mysql, TranscriptionNum):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Accounts WHERE TranscriptionNum = %s", (TranscriptionNum))
        conn.commit()
    except Exception as e:
        print("Error deleting account:", e)
    finally:
        # Ensure resources are closed properly
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
#def createStudyGuide(mysql):
#def readStudyGuide(mysql):
#def updateStudyGuide(mysql):
#def deleteStudyGuide(mysql):
#def createFlashcardSet(mysql):
#def readFlashcardSet(mysql):
#def updateFlashcardSet(mysql):
#def deleteFlashcardSet(mysql):
#def createFlashcard(mysql):
#def readFlashcard(mysql):
#def updateFlashcard(mysql):
#def deleteFlashcard(mysql):
#def createPracticeTest(mysql):
#def readPracticeTest(mysql):
#def updatePracticeTest(mysql):
#def deletePracticeTest(mysql):
#def createQuestion(mysql):
#def readQuestion(mysql):
#def updateQuestion(mysql):
#def deleteQuestion(mysql):
#def createAnswer(mysql):
#def readAnswer(mysql):
#def updateAnswer(mysql):
#def deleteAnswer(mysql):