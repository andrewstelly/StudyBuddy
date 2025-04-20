import React, { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FaFolder } from "react-icons/fa";
import WhackAMoleGame from "../LoadingGames/WhackAMoleGame";
import ProcessComplete from "../ProcessComplete";
import "../Styling/FileUpload.scss";

interface Folder {
  FolderName: string;
  FolderNum: number;
}

const FileUpload: React.FC = () => {
  // -------- folder state & helpers -----------------------------------------
  // folder state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [noFolders, setNoFolders] = useState(false);   // 👈 NEW


  const fetchFolders = async () => {
    try {
      const res = await fetch("http://localhost:5000/folders", {credentials: "include", });
      const data = await res.json();
  
      if (Array.isArray(data.folder) && data.folder.length > 0) {
        setFolders(data.folder);
        setNoFolders(false);            // folders exist
      } else {
        setFolders([]);                 // empty array or bad shape
        setNoFolders(true);
      }
      setFolderError(null);
    } catch (err) {
      console.error("Could not load folders:", err);
      setFolderError("Unable to load folders right now.");
      setNoFolders(false);
    }
  };
  
  useEffect(() => {
    fetchFolders();
  }, []);

  const handleFolderClick = async (folderNum: number) => {
    try {
      const response = await fetch("http://localhost:5000/select_folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ folderNum }),
      });
      localStorage.setItem("currentFolderNum", folderNum.toString());
      const data = await response.json();  
      localStorage.setItem("generatedContent", JSON.stringify(data));
    } catch (err) {
      console.error("Failed to notify server:", err);
      alert("Sorry, couldn’t select that folder." + err);
    }
  };

  // -------- original upload state & helpers --------------------------------
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

  const handleDragLeave = () => setIsDragOver(false);

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

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

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
        credentials: "include",
      });
      const data = await response.json();
      localStorage.setItem("generatedContent", JSON.stringify(data));

      // refresh folders after successful upload
      await fetchFolders();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
      setShowCompleteMessage(true);
      await fetchFolders();
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="file-upload-wrapper">

      {/* ---------- Upload interface ---------- */}
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
      {/* ---------- Folder area ---------- */}
      {folderError && <p className="error">{folderError}</p>}

      {noFolders && !folderError && (
        <p className="empty-message">No folders found yet. Upload a file or create a folder to get started.</p>
      )}

      {folders.length > 0 && (
        <>
          <h2 className="folder-header">Folders</h2>
          <div className="folder-grid">
            {folders.map((f) => (
              <button
                key={f.FolderNum}
                className="folder-tile"
                onClick={() => handleFolderClick(f.FolderNum)}
              >
                <IconContext.Provider value={{ className: "folder-icon", size: "36" }}>
                  <FaFolder />
                </IconContext.Provider>
                <span>{f.FolderName}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div
        className="watermark"
        style={{ position: "fixed", bottom: "10px", right: "10px", zIndex: 999 }}
      >
        © 2025 StudyBuddy, Inc.
      </div>
    </div>
    
  );
};

export default FileUpload;
