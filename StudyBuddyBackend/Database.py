import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
app = Flask(__name__)

app.config['MYSQL_DATABASE_HOST'] = 'study-buddy-database.co3kew2gkyw2.us-east-1.rds.amazonaws.com' # Specify Endpoint
app.config['MYSQL_DATABASE_USER'] = 'admin' # Specify Master username
app.config['MYSQL_DATABASE_PASSWORD'] = 'StudyBuddy!' # Specify Master password
app.config['MYSQL_DATABASE_DB'] = 'StudyBuddy' # Specify database name 

mysql = MySQL(app)

def createAccount():
def readAccount():
def updateAccount():
def deleteAccount():
def createFolder():
def readFolder():
def updateFolder():
def deleteFolder():
def createTranscription():
def readTranscription():
def updateTranscription():
def deleteTranscription():
def createStudyGuide():
def readStudyGuide():
def updateStudyGuide():
def deleteStudyGuide():
def createFlashcardSet():
def readFlashcardSet():
def updateFlashcardSet():
def deleteFlashcardSet():
def createFlashcard():
def readFlashcard():
def updateFlashcard():
def deleteFlashcard():
def createPracticeTest():
def readPracticeTest():
def updatePracticeTest():
def deletePracticeTest():
def createQuestion():
def readQuestion():
def updateQuestion():
def deleteQuestion():
def createAnswer():
def readAnswer():
def updateAnswer():
def deleteAnswer():