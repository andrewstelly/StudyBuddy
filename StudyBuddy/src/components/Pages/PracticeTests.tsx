import React, { useEffect, useState } from "react";

const PracticeTests: React.FC = () => {
    const [practiceTest, setPracticeTest] = useState<string>("Loading...");

    useEffect(() => {
        const storedContent = localStorage.getItem("generatedContent");
        console.log("Retrieved from localStorage (Practice Tests):", storedContent); // Debug log

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
    }, []);

    return (
        <div>
            <h1>Practice Tests</h1>
            <textarea value={practiceTest} readOnly rows={15} cols={80} />
        </div>
    );
};

export default PracticeTests;
