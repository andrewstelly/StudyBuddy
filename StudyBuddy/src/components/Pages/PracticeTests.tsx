import React, { useEffect, useState } from "react";

interface Question {
  type: string;
  question: string;
  options?: string[];
  correct_answer?: any;
}

const PracticeTest: React.FC = () => {
  const [practiceTest, setPracticeTest] = useState<Question[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [gradedResults, setGradedResults] = useState<any | null>(null);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>("Arial");

  useEffect(() => {
    const storedContent = localStorage.getItem("generatedContent");
    if (storedContent) {
      const parsedContent = JSON.parse(storedContent);
      if (parsedContent.practice_test && parsedContent.practice_test.questions) {
        setPracticeTest(parsedContent.practice_test.questions);
        setResponses(new Array(parsedContent.practice_test.questions.length).fill(null));
      }
    }
  }, []);

  const handleResponseChange = (index: number, value: any) => {
    const updatedResponses = [...responses];
    updatedResponses[index] = value;
    setResponses(updatedResponses);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/grade-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, practice_test: { questions: practiceTest } }),
      });
      const data = await response.json();
      setGradedResults(data.graded_results);
    } catch (error) {
      console.error("Error submitting practice test:", error);
    }
  };

  return (
    <div className="page-layout">
      <div
        style={{
          width: "90%",
          maxWidth: "900px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Font Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "10px",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            Font Size:
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={{ padding: "5px" }}
            >
              {[12, 14, 16, 18, 20, 24, 28].map((size) => (
                <option key={size} value={size}>
                  {size}px{size === 16 ? " (Default)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            Font Type:
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              style={{ padding: "5px" }}
            >
              {["Arial", "Courier New", "Georgia", "Times New Roman", "Verdana"].map(
                (font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
          }}
        >
          {practiceTest.length > 0 ? (
            practiceTest.map((question, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Q{index + 1}:</strong> {question.question}
                </p>

                {question.type === "multiple_choice" && question.options && (
                  <div>
                    {question.options.map((option, i) => (
                      <label key={i} style={{ display: "block", marginBottom: "5px" }}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          onChange={() => handleResponseChange(index, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "true_false" && (
                  <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="true"
                        onChange={() => handleResponseChange(index, true)}
                      />
                      True
                    </label>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="false"
                        onChange={() => handleResponseChange(index, false)}
                      />
                      False
                    </label>
                  </div>
                )}

                {question.type === "discussion" && (
                  <textarea
                    placeholder="Type your answer here..."
                    style={{ width: "100%", height: "100px", marginTop: "10px" }}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                  />
                )}
              </div>
            ))
          ) : (
            <p>No practice test available.</p>
          )}

          {/* Graded Results */}
          {gradedResults && (
            <div style={{ marginTop: "20px" }}>
              <h2>Graded Results</h2>
              <div>
                {gradedResults.map((result: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "15px",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      backgroundColor: result.correct ? "#d4edda" : "#f8d7da",
                    }}
                  >
                    <p>
                      <strong>Q{index + 1}:</strong> {result.question}
                    </p>
                    <p>
                      Your Answer:{" "}
                      {result.user_response === true
                        ? "True"
                        : result.user_response === false
                        ? "False"
                        : result.user_response}{" "}
                      {result.correct ? (
                        <span style={{ color: "green" }}>✔</span>
                      ) : (
                        <span style={{ color: "red" }}>✘</span>
                      )}
                    </p>
                    {!result.correct && result.correct_answer !== undefined && (
                      <p>
                        Correct Answer:{" "}
                        <strong>
                          {typeof result.correct_answer === "boolean"
                            ? result.correct_answer
                              ? "True"
                              : "False"
                            : result.correct_answer}
                        </strong>
                      </p>
                    )}
                    {result.evaluation && (
                      <p>
                        ChatGPT Evaluation: <strong>{result.evaluation}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      {/* Submit Button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleSubmit}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "200px"
          }}
        >
          Submit Test
        </button>
      </div>
      </div>
    </div>
  );
};

export default PracticeTest;
