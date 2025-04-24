
import React, { useState, useEffect } from "react";

import WhackAMoleGame from "../LoadingGames/WhackAMoleGame";
import ProcessComplete from "../ProcessComplete";
import "../Styling/FileUpload.scss";
import { promiseHooks } from "v8";

const API = "http://localhost:5000";

interface Folder {
  FolderName: string;
  FolderNum: number;
}

const FileUpload: React.FC = () => {
  /* ---------- existing state ---------- */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [shake, setShake] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- new state ---------- */
  const [folders, setFolders] = useState<Folder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  /* ---------- fetch folders once after mount ---------- */
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${API}/folders`, {
          method: "GET",
          credentials: "include",          // send session cookie
        });
        const json = await res.json();
        setFolders(json.folder ?? []);     // server returns { folder: [...] }
      } catch (err) {
        console.error("Error fetching folders:", err);
      } finally {
        setFoldersLoading(false);
      }
    };
    fetchFolders();
  }, []);

  /* ---------- drag‑and‑drop & file selection ---------- */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];

    if (selectedFile) {
      setShake(true);
      setTimeout(() => setShake(false), 1500);
      return;
    }

    if (droppedFile) setSelectedFile(droppedFile);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRecordAudio = async () => {
    if (!isRecording) {
      try {
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

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Recording failed:", err);
        alert("Microphone access denied or not supported.");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }

    }
  };

  /* ---------- upload file ---------- */
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
    formData.append("translate", String(translate));
    formData.append("targetLanguage", targetLanguage);
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${API}/folders`, {
          method: "GET",
          credentials: "include",          // send session cookie
        });
        const json = await res.json();
        setFolders(json.folder ?? []);     // server returns { folder: [...] }
      } catch (err) {
        console.error("Error fetching folders:", err);
      } finally {
        setFoldersLoading(false);
      }
    };
    setIsLoading(true);
    try {
      const res  = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      console.log("writing LS")
      localStorage.setItem("generatedContent", JSON.stringify(data));
      window.dispatchEvent(new Event("generatedContentUpdated"));
      fetchFolders();
    } 
      catch (err) {
      console.error(err);
    } finally {
      // ❶
      setIsLoading(false);
      setShowCompleteMessage(true);
    }
  };

  /* ---------- click folder & retrieve contents ---------- */
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

    } catch (err) {
      console.error(err);
    } finally {
      window.dispatchEvent(new Event("generatedContentUpdated"));   // ❶
      setIsLoading(false);
      setShowCompleteMessage(true);
    }
  };

  /* ---------- UI ---------- */
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
          marginBottom: "40px",
          marginTop: "-50px",
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
          {/* --------------- upload box --------------- */}
          <div
            className={`drag-drop-box ${isDragOver ? "highlight" : ""} ${shake ? "shake-box" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <h1 className="file-upload-header">File Upload</h1>
            <p>Drag &amp; Drop file here or</p>
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
            {shake && <p className="warning-text">Cannot upload file — one is already selected.</p>}
          </div>

          <button
            onClick={handleRecordAudio}
            disabled={!!selectedFile}
            className={`record-button ${isRecording ? "recording" : ""}`}
          >
            {isRecording ? "Stop Recording" : " Record Audio"}
          </button>

          {/* --------------- options --------------- */}
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
              <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
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

          {/* --------------- folders list --------------- */}
          <div className="folder-section">
            <h2>Your Folders</h2>
            {foldersLoading ? (
              <p>Loading…</p>
            ) : folders.length === 0 ? (
              <p>No folders found.</p>
            ) : (
              <ul className="folder-list">
                {folders.map((f) => (
                  <li key={f.FolderNum}>
                    <button className="folder-btn" onClick={() => handleFolderClick(f.FolderNum)}>
                      {f.FolderName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* --------------- completion modal --------------- */}
      {showCompleteMessage && (
        <ProcessComplete onComplete={() => setShowCompleteMessage(false)} />
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
        © 2025 StudyBuddy, Inc.
      </div>
    </div>
  );
};

export default FileUpload;
