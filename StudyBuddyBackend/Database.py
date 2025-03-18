import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
app = Flask(__name__)
from datetime import date

def createAccount(mysql,email, username, password):
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Accounts (Email, Username, Password, Salt) VALUES ("+str(email)+", "+str(username)+", "+str(password)+", "+str(date.today)+");")
    conn.close()
def readAllAccount(mysql):
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers")
    data = cursor.fetchall()
    for row in data:
        print(row)
    conn.close()
#def updateAccount(mysql):
#def deleteAccount(mysql):
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