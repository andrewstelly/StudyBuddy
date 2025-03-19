import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
app = Flask(__name__)
from datetime import datetime
def createAccount(mysql,email, username, password):
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Accounts (Email, Username, Password, Joindate) VALUES (%s, %s, %s, %s)", (email, username, password, datetime.today().strftime('%Y-%m-%d')))
    conn.commit()
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
        cursor.execute("DELETE FROM Accounts WHERE Username = %s", (username,))
        conn.commit()
    except Exception as e:
        print("Error deleting account:", e)
    finally:
        # Ensure resources are closed properly
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
#def createFolder(mysql):
#def readFolder(mysql):
#def updateFolder(mysql):
#def deleteFolder(mysql):
#def createTranscription(mysql):
#def readTranscription(mysql):
#def updateTranscription(mysql):
#def deleteTranscription(mysql):
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