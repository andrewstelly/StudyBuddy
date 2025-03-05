import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ShadcnButton } from "../UI/ShadcnButton"; 

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the auth cookie
    Cookies.remove("auth");
    // Redirect to the login page
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
        console.error("Failed to download transcription");
      }
    } catch (error) {
      console.error("Error downloading transcription:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="file-upload-container">
        <h1 className="file-upload-title">Settings</h1>
        <ShadcnButton
          onClick={handleLogout}
          className="w-full mb-4"
          variant="destructive"
        >
          Log Out
        </ShadcnButton>
        <ShadcnButton
          onClick={handleDownload}
          className="w-full"
          variant="default"
        >
          Download Transcription
        </ShadcnButton>
      </div>
    </div>
  );
};

export default Settings;