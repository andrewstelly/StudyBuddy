import React, { useState } from "react";
import WhackAMoleGame from "../LoadingGames/WhackAMoleGame";
import ProcessComplete from "../ProcessComplete";
import "../Styling/FileUpload.scss";

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

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

  const handleRecordAudio = async () => {
    if (!isRecording) {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setRecordedAudio(audioBlob);
        setIsRecording(false);
      };

      mediaRecorder.start();
      (window as any).mediaRecorder = mediaRecorder;
    } else {
      const mediaRecorder = (window as any).mediaRecorder;
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile && !recordedAudio) {
      alert("Please select a file or record audio first.");
      return;
    }

    if (translate && !targetLanguage) {
      alert("Please select a language for translation.");
      return;
    }

    const formData = new FormData();
    if (recordedAudio) {
      formData.append("file", recordedAudio, "recorded_audio.wav");
    } else if (selectedFile) {
      formData.append("file", selectedFile);
    }
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

          <button onClick={handleRecordAudio}>
            {isRecording ? "Stop Recording" : "Record Audio"}
          </button>

          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={translate}
                onChange={() => setTranslate(!translate)}
                style={{ width: "20px", height: "20px" }}
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
