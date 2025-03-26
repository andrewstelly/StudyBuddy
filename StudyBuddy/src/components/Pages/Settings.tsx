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
        const blob = await response.blob(); // Convert response to a Blob
        const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
        const a = document.createElement("a"); // Create a temporary anchor element
        a.href = url;
        a.download = "transcription.txt"; // Set the file name for download
        document.body.appendChild(a); // Append the anchor to the document
        a.click(); // Trigger the download
        a.remove(); // Remove the anchor from the document
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