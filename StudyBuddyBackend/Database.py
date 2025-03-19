import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
app = Flask(__name__)
from datetime import date

def createAccount(mysql,email, username, password):
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Accounts (Email, Username, Password, Joindate) VALUES ("+str(email)+", "+str(username)+", "+str(password)+", "+str(date.today)+");")
    conn.close()
def readAllAccount(mysql):
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Accounts")
    data = cursor.fetchall()
    for row in data:
        print(row)
    conn.close()
def updateAccount(mysql,userName ,column, value):
    conn = mysql.connect()
    cursor = conn.cursor()
    if("password" == column or column == "Password"):
        cursor.execute("SELECT Joindate FROM Accounts WHERE " + (userName) +" == Username;")
        data = cursor.fetchall()
        for row in data:
            joinDate = row
        print(joinDate)
        cursor.execute("UPDATE Account SET Password = " + str(value+joinDate) + " WHERE " + (userName) +" == Username;")

    conn.close()
def deleteAccount(mysql):
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