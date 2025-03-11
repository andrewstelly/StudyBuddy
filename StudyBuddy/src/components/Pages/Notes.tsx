import React, { useEffect, useState } from "react";

const Notes: React.FC = () => {
    const [studyGuide, setStudyGuide] = useState<string>("Loading...");
    const [fontSize, setFontSize] = useState<number>(16); // Default font size
    const [fontFamily, setFontFamily] = useState<string>("Arial"); // Default font type

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

    // ✅ Handle user input
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStudyGuide(event.target.value);
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

                <textarea 
                    className="text-box"
                    value={studyGuide}
                    onChange={handleChange}
                    style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }} // ✅ Apply dynamic font size & type
                />
            </div>
        </div>
    );
};

export default Notes;
