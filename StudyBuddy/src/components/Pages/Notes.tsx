import React, { useEffect, useState } from "react";
import '../Styling/fonts.css';

const Notes: React.FC = () => {
    const [studyGuide, setStudyGuide] = useState<string>("Loading...");
    const [fontSize, setFontSize] = useState<number>(16);
    const [fontFamily, setFontFamily] = useState<string>("Arial");
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    useEffect(() => {
        const storedContent = localStorage.getItem("generatedContent");
        console.log("Retrieved from localStorage (Study Guide):", storedContent);

        if (storedContent) {
            try {
                const parsedContent = JSON.parse(storedContent);
                if (parsedContent.study_guide) {
                    setStudyGuide(parsedContent.study_guide);
                } else {
                    setStudyGuide("No study guide available.");
                }
            } catch (error) {
                console.error("Error parsing stored content:", error);
                setStudyGuide("Error loading study guide.");
            }
        } else {
            setStudyGuide("No study guide found.");
        }
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStudyGuide(event.target.value);
    };

    const handleTextToSpeech = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const voiceName = localStorage.getItem("preferredVoice");
            const utterance = new SpeechSynthesisUtterance(studyGuide);

            const matchedVoice = window.speechSynthesis
                .getVoices()
                .find((v) => v.name === voiceName);

            if (matchedVoice) {
                utterance.voice = matchedVoice;
            }

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            setIsSpeaking(true);

            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    const retryVoice = window.speechSynthesis
                        .getVoices()
                        .find((v) => v.name === voiceName);
                    if (retryVoice) {
                        utterance.voice = retryVoice;
                    }
                    window.speechSynthesis.speak(utterance);
                };
            } else {
                window.speechSynthesis.speak(utterance);
            }
        }
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
                        backgroundColor: "#ebf6ff",
                        border: "1px solid #ccc",
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
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        padding: "10px",
                        boxSizing: "border-box",
                        backgroundColor: "#ebf6ff",
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
