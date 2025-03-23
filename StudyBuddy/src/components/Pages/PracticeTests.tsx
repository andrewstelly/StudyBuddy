import React, { useEffect, useState } from "react";

const PracticeTest: React.FC = () => {
    const [practiceTest, setPracticeTest] = useState<string>("Loading...");
    const [fontSize, setFontSize] = useState<number>(16); // Default font size
    const [fontFamily, setFontFamily] = useState<string>("Arial"); // Default font type
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false); // Track if TTS is active
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]); // Available voices
    const [selectedVoice, setSelectedVoice] = useState<string>(""); // Selected voice

    useEffect(() => {
        const storedContent = localStorage.getItem("generatedContent");
        console.log("Retrieved from localStorage (Practice Test):", storedContent);

        if (storedContent) {
            try {
                const parsedContent = JSON.parse(storedContent);
                if (parsedContent.practice_test) {
                    setPracticeTest(parsedContent.practice_test);
                } else {
                    setPracticeTest("No practice test available.");
                }
            } catch (error) {
                console.error("Error parsing stored content:", error);
                setPracticeTest("Error loading practice test.");
            }
        } else {
            setPracticeTest("No practice test found.");
        }

        // Fetch available voices
        const fetchVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            if (availableVoices.length > 0) {
                setSelectedVoice(availableVoices[0].name); // Default to the first voice
            }
        };

        // Fetch voices when they are loaded
        fetchVoices();
        window.speechSynthesis.onvoiceschanged = fetchVoices;
    }, []);

    // ✅ Handle user input
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPracticeTest(event.target.value);
    };

    // ✅ Text-to-Speech Functionality
    const handleTextToSpeech = () => {
        if (isSpeaking) {
            // Stop speech if already speaking
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            // Start speech
            const utterance = new SpeechSynthesisUtterance(practiceTest);
            utterance.voice = voices.find((voice) => voice.name === selectedVoice) || null; // Set selected voice
            utterance.onend = () => setIsSpeaking(false); // Reset state when speech ends
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    return (
        <div className="page-layout">
            <div style={{ width: "90%", maxWidth: "900px", height: "80vh", display: "flex", flexDirection: "column" }}>

                {/* ✅ Font Controls - Side by Side */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "10px" }}>
                    
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

                    {/* Font Type Selector */}
                    <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        Font Type:
                        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ padding: "5px" }}>
                            <option value="Arial">Arial</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Verdana">Verdana</option>
                        </select>
                    </label>
                </div>

                {/* ✅ Voice Selector */}
                <label style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    Voice:
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        style={{ padding: "5px" }}
                    >
                        {voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </label>

                {/* ✅ Text-to-Speech Button */}
                <button
                    onClick={handleTextToSpeech}
                    style={{
                        marginBottom: "10px",
                        padding: "10px 20px",
                        backgroundColor: isSpeaking ? "red" : "green",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    {isSpeaking ? "Stop Speaking" : "Read Aloud"}
                </button>

                <textarea 
                    className="text-box"
                    value={practiceTest}
                    onChange={handleChange}
                    style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }} // ✅ Apply dynamic font size & type
                />
            </div>
        </div>
    );
};

export default PracticeTest;