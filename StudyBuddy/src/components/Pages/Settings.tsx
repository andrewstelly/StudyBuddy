import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ShadcnButton } from "../UI/ShadcnButton";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("auth");
    navigate("/");
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("http://localhost:5000/download-transcription");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transcription.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error("Failed to download transcription:", response.statusText);
        alert("Failed to download transcription. Please try again.");
      }
    } catch (error) {
      console.error("Error downloading transcription:", error);
      alert("An error occurred while downloading the transcription.");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Settings</h1>
        <ShadcnButton
          onClick={handleLogout}
          className="mb-4"
          variant="destructive"
        >
          Log Out
        </ShadcnButton>
        <ShadcnButton
          onClick={handleDownload}
          variant="default"
        >
          Download Transcription
        </ShadcnButton>
      </div>
    {/* Watermark */}
    <div className="watermark">
     © 2025 StudyBuddy, Inc.
    </div>
    </div>
  );
};

export default Settings;
