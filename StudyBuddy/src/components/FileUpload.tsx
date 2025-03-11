import React, { useState } from "react";

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(false);
  const [studyGuide, setStudyGuide] = useState(false);
  const [practiceTest, setPracticeTest] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
        alert("Please select a file first.");
        return;
    }

    if (translate && !targetLanguage) {
        alert("Please select a language for translation.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("summary", summary.toString());
    formData.append("studyGuide", studyGuide.toString());
    formData.append("practiceTest", practiceTest.toString());
    formData.append("translate", translate.toString());
    formData.append("targetLanguage", targetLanguage);

    console.log("🛠 FormData being sent:");
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    setIsLoading(true);

    try {
        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("📩 Response from backend:", data); // Debug log

        if (!data.practice_test) {
            console.error(" Error: Backend did not return a practice test.");
        } else {
            console.log("Practice Test:", data.practice_test);
        }

        // Store in local storage
        const storedData = {
            summary: data.summary || "No summary available.",
            study_guide: data.study_guide || "No study guide available.",
            practice_test: data.practice_test || "No practice test available.",  // Ensure practice test is stored
            translation: data.translation || "No translation available.",
        };

        localStorage.setItem("generatedContent", JSON.stringify(storedData));
        console.log("Saved to localStorage:", localStorage.getItem("generatedContent"));

    } catch (error) {
        console.error(" Error uploading file:", error);
    } finally {
        setIsLoading(false);
    }
};


  return (
    <div className="file-upload-container">
      {isLoading ? (
        <div className="loading-screen">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <h1 className="file-upload-title">File Upload</h1>
          <input type="file" onChange={handleFileChange} />
          {selectedFile && <p>{selectedFile.name}</p>}
          <div>
            <label>
              <input type="checkbox" checked={summary} onChange={() => setSummary(!summary)} />
              Summary
            </label>
            <label>
              <input type="checkbox" checked={studyGuide} onChange={() => setStudyGuide(!studyGuide)} />
              Study Guide
            </label>
            <label>
              <input type="checkbox" checked={practiceTest} onChange={() => setPracticeTest(!practiceTest)} />
              Practice Test
            </label>
            <label>
              <br></br>
              <input type="checkbox" checked={translate} onChange={() => setTranslate(!translate)} />
              Translate
            </label>
            {translate && (
              <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
                <option value="">Select Language</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            )}
          </div>
          <br></br>
          <button onClick={handleUpload}>Upload</button>
        </>
      )}
    </div>
  );
};

export default FileUpload;
