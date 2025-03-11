import React, { useEffect, useState } from "react";

const Notes: React.FC = () => {
    const [studyGuide, setStudyGuide] = useState<string>("Loading...");

    useEffect(() => {
        const storedContent = localStorage.getItem("generatedContent");
        console.log("Retrieved from localStorage (Study Guide):", storedContent); // Debug log

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

    return (
        <div>
            <h1>Notes</h1>
            <textarea value={studyGuide} readOnly rows={15} cols={80} />
        </div>
    );
};

export default Notes;
