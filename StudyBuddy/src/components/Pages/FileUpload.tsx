import React, { useState } from "react";
import WhackAMoleGame from "../LoadingGames/WhackAMoleGame";
import ProcessComplete from "../ProcessComplete";
import "../Styling/FileUpload.scss";

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);
  const [summary, setSummary] = useState(false);
  const [studyGuide, setStudyGuide] = useState(false);
  const [practiceTest, setPracticeTest] = useState(false);
  const [flashcards, setFlashcards] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false); // ✅ Highlight state

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setSelectedFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    if (translate && !targetLanguage) {
      alert("Please select a language for translation.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("summary", summary.toString());
    formData.append("studyGuide", studyGuide.toString());
    formData.append("practiceTest", practiceTest.toString());
    formData.append("flashcards", flashcards.toString());
    formData.append("translate", translate.toString());
    formData.append("targetLanguage", targetLanguage);

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      localStorage.setItem("generatedContent", JSON.stringify(data));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
      setShowCompleteMessage(true);
    }
  };

  return (
    <div className="file-upload-wrapper">
      {isLoading ? (
        <div className="loading-screen">
          <WhackAMoleGame />
        </div>
      ) : (
        <>
          <div
            className={`drag-drop-box ${isDragOver ? "highlight" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <h1 className="file-upload-header">File Upload</h1>
            <p>Drag & Drop file here or</p>
            <label className="file-input-label">
              <input type="file" onChange={handleFileChange} />
              Choose File
            </label>
            {selectedFile && <p className="file-name">{selectedFile.name}</p>}
          </div>

          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={summary}
                onChange={() => setSummary(!summary)}
                style={{ width: "20px", height: "20px" }} // Increased size
              />
              Summary
            </label>
            <label>
              <input
                type="checkbox"
                checked={studyGuide}
                onChange={() => setStudyGuide(!studyGuide)}
                style={{ width: "20px", height: "20px" }} // Increased size
              />
              Study Guide
            </label>
            <label>
              <input
                type="checkbox"
                checked={practiceTest}
                onChange={() => setPracticeTest(!practiceTest)}
                style={{ width: "20px", height: "20px" }} // Increased size
              />
              Practice Test
            </label>
            <label>
              <input
                type="checkbox"
                checked={flashcards}
                onChange={() => setFlashcards(!flashcards)}
                style={{ width: "20px", height: "20px" }} // Increased size
              />
              Flashcards
            </label>
            <label>
              <input
                type="checkbox"
                checked={translate}
                onChange={() => setTranslate(!translate)}
                style={{ width: "20px", height: "20px" }} // Increased size
              />
              Translate
            </label>

            {translate && (
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                <option value="">Select Language</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            )}
          </div>

          <button className="upload-button" onClick={handleUpload}>
            Upload
          </button>
        </>
      )}

      {showCompleteMessage && (
        <ProcessComplete onComplete={() => setShowCompleteMessage(false)} />
      )}
    </div>
  );
};

export default FileUpload;
