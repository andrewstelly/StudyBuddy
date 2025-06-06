import React, { useEffect, useState } from "react";
import "../Styling/fonts.css";
import useGeneratedContent from "../hooks/useGeneratedContent";   // ✅ correct path

const Notes: React.FC = () => {
  /* ------------------------------------------------------------------ */
  /* live payload shared across the app                                  */
  /* ------------------------------------------------------------------ */
  const content = useGeneratedContent();           // hook keeps itself updated

  /* page state */
  const [studyGuide, setStudyGuide] = useState("Loading…");
  const [fontSize,   setFontSize]  = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>("Arial");

  /* text‑to‑speech state */
  const [isSpeaking,    setIsSpeaking]    = useState(false);
  const [voices,        setVoices]        = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  /* refresh study‑guide whenever the shared payload changes */
  useEffect(() => {
    if (content?.study_guide) {
      setStudyGuide(content.study_guide);
    } else {
      setStudyGuide("No study guide available.");
    }
  }, [content]);

  /* one‑time voice list setup */
  useEffect(() => {
    const fetchVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length) setSelectedVoice(v[0].name);
    };
    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  /* handlers */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setStudyGuide(e.target.value);

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const ut = new SpeechSynthesisUtterance(studyGuide);
    ut.voice = voices.find(v => v.name === selectedVoice) || null;
    ut.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(ut);
    setIsSpeaking(true);
  };

  return (
    <div className="page-layout">
        <div style={{ width: "90%", maxWidth: "900px", height: "80vh", display: "flex", flexDirection: "column"}}>

        <div
        style={{
            width: "100%",
            borderBottom: "0.1875rem solid #7ea3dc",
            fontWeight: "bold",
            fontSize: "1.5rem",
            textAlign: "left",
            paddingBottom: "0.375rem",
            marginBottom: "0.875rem",
            color: "#264653",
        }}
        >
        Notes
        </div>
            {/* Control Container */}
            <div
                style={{
                    backgroundColor: "#abccf1",
                    border: "1px solid gray",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                }}
            >
                {/* Font Size Selector */}
                <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    Font Size:
                    <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} style={{ padding: "5px" }}>
                        <option value={12}>12px</option>
                        <option value={14}>14px</option>
                        <option value={16}>16px (Default)</option>
                        <option value={18}>18px</option>
                        <option value={20}>20px</option>
                        <option value={24}>24px</option>
                        <option value={28}>28px</option>
                    </select>
                </label>

                {/* Read Aloud Button */}
                <button
                onClick={handleTextToSpeech}
                className={`read-button ${isSpeaking ? "recording" : ""}`}
                style={{
                    width: "200px",
                    height: "40px",
                    marginTop: "0px",
                }}
                >
                {isSpeaking ? "Stop Speaking" : "Read Aloud"}
                </button>


                {/* Font Type Selector */}
                <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    Font Type:
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ padding: "5px" }}>
                        <option value="Arial">Arial</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Verdana">Verdana</option>
                        <option value="OpenDyslexic">OpenDyslexic</option>
                    </select>
                </label>
            </div>

            {/* Textarea */}
            <textarea
                className="text-box"
                value={studyGuide}
                onChange={handleChange}
                style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: fontFamily,
                    resize: "none",
                    flexGrow: 1,
                    width: "100%",
                    border: "1px solid gray",
                    borderRadius: "5px",
                    padding: "10px",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                }}
            />
        </div>

        {/* Watermark */}
        <div className="watermark">
            © 2025 StudyBuddy, Inc.
        </div>
    </div>
);
};

export default Notes;
