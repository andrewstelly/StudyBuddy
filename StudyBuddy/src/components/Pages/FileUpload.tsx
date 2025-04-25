import React, { useState, useEffect, useRef } from "react";
import WhackAMoleGame from "../LoadingGames/WhackAMoleGame";
import ProcessComplete from "../ProcessComplete";
import { Folder as FolderIcon } from "lucide-react"; // <--- ICON
import "../Styling/FileUpload.scss";

const API = "http://localhost:5000";

interface Folder {
  FolderName: string;
  FolderNum: number;
}

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [shake, setShake] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [translate, setTranslate] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  useEffect(() => {
    fetchFolderList();
  }, []);

  const fetchFolderList = async () => {
    try {
      const res = await fetch(`${API}/folders`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json();
      setFolders(json.folder ?? []);
    } catch (err) {
      console.error("Error fetching folders:", err);
    } finally {
      setFoldersLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (selectedFile) {
      setShake(true);
      setTimeout(() => setShake(false), 1500);
      return;
    }
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (selectedFile) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (file) setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setRecordedAudio(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRecordAudio = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
        mediaRecorder.onstop = () => {
          setRecordedAudio(new Blob(audioChunks, { type: "audio/wav" }));
          setIsRecording(false);
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Recording failed:", err);
        alert("Microphone access denied or not supported.");
      }
    } else {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
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
    if (recordedAudio) formData.append("file", recordedAudio, "recorded_audio.wav");
    else if (selectedFile) formData.append("file", selectedFile);
    formData.append("translate", translate.toString());
    formData.append("targetLanguage", targetLanguage);

    setIsLoading(true);

    try {
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      localStorage.setItem("generatedContent", JSON.stringify(data));
      window.dispatchEvent(new Event("generatedContentUpdated"));
      fetchFolderList();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed.");
    } finally {
      setIsLoading(false);
      setShowCompleteMessage(true);
      setSelectedFile(null);  // clear uploaded file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFolderClick = async (folderNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/select_folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ folderNum }),
      });
      const data = await res.json();
      localStorage.setItem("generatedContent", JSON.stringify(data));
      window.dispatchEvent(new Event("generatedContentUpdated"));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setShowCompleteMessage(true);
    }
  };

  return (
    <div className="file-upload-wrapper">
      <div
        style={{
          borderBottom: "3px solid #7ea3dc",
          fontWeight: "bold",
          width: "100%",
          fontSize: "28px",
          textAlign: "center",
          paddingBottom: "6px",
          color: "#264653",
          userSelect: "none",
        }}
      >
        Home
      </div>

      {isLoading ? (
        <div className="loading-screen">
          <WhackAMoleGame />
        </div>
      ) : (
        <>
          {/* File Upload Section */}
          <div
            className={`drag-drop-box ${isDragOver ? "highlight" : ""} ${shake ? "shake-box" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="file-upload-header">File Upload</div>
            <p>Drag & Drop file here or</p>
            <label className="file-input-label">
              <input ref={fileInputRef} type="file" onChange={handleFileChange} />
              Choose File
            </label>
            {selectedFile && (
              <p className="file-name">
                {selectedFile.name}
                <button
                  onClick={handleRemoveFile}
                  className="remove-file-button"
                  title="Remove file"
                >
                  ✖
                </button>
              </p>
            )}
            <p className={`warning-text ${shake ? "visible" : ""}`}>
              Cannot upload file — one is already selected.
            </p>
          </div>

          {/* Top Controls */}
          <div
            style={{
              backgroundColor: "#ebf6ff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "20px",
              width: "90%",
              maxWidth: "900px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button
                onClick={handleRecordAudio}
                disabled={!!selectedFile}
                className={`read-button ${isRecording ? "recording" : ""}`}
                style={{ width: "200px", height: "40px" }}
              >
                {isRecording ? "Stop Recording" : "Record Audio"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button
                onClick={() => setTranslate(!translate)}
                className="upload-button"
                style={{ width: "200px", height: "40px" }}
              >
                {translate ? "Translation: On" : "Translate"}
              </button>

              {translate && (
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  style={{
                    marginTop: "8px",
                    width: "200px",
                    height: "40px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Select Language</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                </select>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button
                className="upload-button"
                onClick={handleUpload}
                style={{ width: "200px", height: "40px" }}
              >
                Upload
              </button>
            </div>
          </div>

          {/* Folders Section */}
          <div
            style={{
              backgroundColor: "#ebf6ff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
              width: "90%",
              maxWidth: "900px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#264653",
                marginBottom: "1rem",
                borderBottom: "2px solid #7ea3dc",
                paddingBottom: "8px",
                textAlign: "center",
              }}
            >
              Your Folders
            </h2>

            {foldersLoading ? (
              <p>Loading…</p>
            ) : folders.length === 0 ? (
              <p>No folders found.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",  // <-- Center folders dynamically
                  gap: "1rem",
                }}
              >
                {folders.map((folder) => (
                  <button
                    key={folder.FolderNum}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      minWidth: "200px",
                      maxWidth: "220px",
                      minHeight: "60px",
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color: "#264653",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dceeff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                    onClick={() => handleFolderClick(folder.FolderNum)}
                  >
                    <FolderIcon size={20} color="#f4c430" /> {folder.FolderName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PROCESS COMPLETE */}
          {showCompleteMessage && (
            <ProcessComplete onComplete={() => setShowCompleteMessage(false)} />
          )}
        </>
      )}

      <div
        className="watermark"
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          zIndex: 999,
        }}
      >
        © 2025 StudyBuddy, Inc.
      </div>
    </div>
  );
};

export default FileUpload;
