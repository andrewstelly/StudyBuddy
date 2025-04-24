import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [showVoiceDropdown, setShowVoiceDropdown] = useState<boolean>(false);

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      const savedVoice = localStorage.getItem("preferredVoice");
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
  }, []);

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
      <div
        className="settings-container"
        style={{
          height: "500px", // Fixed height
          overflow: "hidden", // Prevent stretching
        }}
      >
        <div
          style={{
            textAlign: "center",
            borderBottom: "3px solid #7ea3dc",
            fontWeight: "bold",
            fontSize: "24px",
            paddingBottom: "6px",
            marginBottom: "14px",
            color: "#264653",
          }}
        >
          Settings
        </div>

        <button onClick={handleLogout} className="settings-button">
          Log Out
        </button>

        <button onClick={handleDownload} className="settings-button">
          Download Transcription
        </button>

        {/* Toggleable Preferred Voice Dropdown */}
        <div>
          <button
            onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
            className="settings-button"
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            {selectedVoice ? `Voice: ${selectedVoice}` : "Select Preferred Voice"}
          </button>

          <div
            style={{
              maxHeight: showVoiceDropdown ? "120px" : "0px",
              overflowY: "auto",
              transition: "max-height 0.3s ease",
            }}
          >
            {showVoiceDropdown && (
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  localStorage.setItem("preferredVoice", e.target.value);
                  setShowVoiceDropdown(false);
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Voice</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="watermark">© 2025 StudyBuddy, Inc.</div>
    </div>
  );
};

export default Settings;
