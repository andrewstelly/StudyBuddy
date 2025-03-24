import React, { useState, useEffect } from "react";
import WhackAMoleGame from "./LoadingGames/WhackAMoleGame";
import ProcessComplete from "./ProcessComplete";

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);
  const [summary, setSummary] = useState(false);
  const [studyGuide, setStudyGuide] = useState(false);
  const [practiceTest, setPracticeTest] = useState(false);
  const [flashcards, setFlashcards] = useState(false); // New state for flashcards
  const [translate, setTranslate] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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
    formData.append("flashcards", flashcards.toString()); // Add flashcards flag
    formData.append("translate", translate.toString());
    formData.append("targetLanguage", targetLanguage);

    console.log("🛠 FormData being sent:");
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response from backend:", data);  // Debug log

      // Store results in localStorage
      localStorage.setItem("generatedContent", JSON.stringify(data));
      console.log("Stored in localStorage:", localStorage.getItem("generatedContent"));  // Debug log
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
      setShowCompleteMessage(true);
    }
  };

  return (
    <div className="file-upload-container">
      {isLoading ? (
        <div className="loading-screen">
          <WhackAMoleGame />
        </div>
      ) : (
        <>
          <h1 className="file-upload-title" style={{ color: 'white' }}>File Upload</h1>
          <br>
          </br>
          <input type="file" onChange={handleFileChange} />
          {selectedFile && <p>{selectedFile.name}</p>}
          <div style={{justifyContent: 'center', marginTop: 'auto' }}>
            <label>
              <input type="checkbox" checked={summary} onChange={() => setSummary(!summary)} />
              Summary&nbsp;&nbsp;&nbsp;
            </label>
            <label>
              <input type="checkbox" checked={studyGuide} onChange={() => setStudyGuide(!studyGuide)} />
              Study Guide
            </label>
            <br> 
            </br>
            <label>
              <input type="checkbox" checked={practiceTest} onChange={() => setPracticeTest(!practiceTest)} />
              Practice Test&nbsp;&nbsp;&nbsp;
            </label>
            <label>
              <input type="checkbox" checked={flashcards} onChange={() => setFlashcards(!flashcards)} />
              Flashcards
            </label>
            <label>
              <input type="checkbox" checked={translate} onChange={() => setTranslate(!translate)} />
              Translate
            </label>
            {translate && (
              <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
                <option value="">Select Language</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
            <button onClick={handleUpload}>Upload</button>
          </div>
        </>
      )}
      {showCompleteMessage && <ProcessComplete onComplete={() => setShowCompleteMessage(false)} />}
    </div>
  );
};

export default FileUpload;