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

  /* ------------------------------------------------------------------ */
  /* UI                                                                  */
  /* ------------------------------------------------------------------ */
  return (
    <div className="page-layout">
      <div
        style={{
          width: "90%",
          maxWidth: 900,
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* font / family controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 10,
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            Font Size:
            <select
              value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value))}
              style={{ padding: 5 }}
            >
              {[12, 14, 16, 18, 20, 24, 28].map(sz => (
                <option key={sz} value={sz}>
                  {sz}px{sz === 16 ? " (Default)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            Font Type:
            <select
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value)}
              style={{ padding: 5 }}
            >
              {[
                "Arial",
                "Courier New",
                "Georgia",
                "Times New Roman",
                "Verdana",
                "OpenDyslexic",
              ].map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* voice selector */}
        <label style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          Voice:
          <select
            value={selectedVoice}
            onChange={e => setSelectedVoice(e.target.value)}
            style={{ padding: 5 }}
          >
            {voices.map(v => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>

        {/* text‑to‑speech button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleTextToSpeech}
            style={{
              marginBottom: 10,
              padding: "10px 20px",
              backgroundColor: isSpeaking ? "red" : "green",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              width: 200,
            }}
          >
            {isSpeaking ? "Stop Speaking" : "Read Aloud"}
          </button>
        </div>

        {/* study‑guide textarea */}
        <textarea
          className="text-box"
          value={studyGuide}
          onChange={handleChange}
          style={{
            flexGrow: 1,
            width: "100%",
            fontSize: `${fontSize}px`,
            fontFamily,
            resize: "none",
            border: "1px solid #ccc",
            borderRadius: 5,
            padding: 10,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div className="watermark">© 2025 StudyBuddy, Inc.</div>
    </div>
  );
};

export default Notes;