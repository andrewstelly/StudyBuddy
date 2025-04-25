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
  const [grade, setGrade] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedContent = localStorage.getItem("generatedContent");
    if (storedContent) {
      const parsedContent = JSON.parse(storedContent);

      // Check if practice_test is a string and parse it
      if (parsedContent.practice_test) {
        const practiceTestData =
          typeof parsedContent.practice_test === "string"
            ? JSON.parse(parsedContent.practice_test) // Parse stringified JSON
            : parsedContent.practice_test; // Use as-is if already an object

        if (practiceTestData.questions) {
          setPracticeTest(practiceTestData.questions);
          setResponses(new Array(practiceTestData.questions.length).fill(null));
        }
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

      if (response.ok) {
        setGradedResults(data.graded_results);
        const correctAnswers = data.graded_results.filter((result: any) => result.correct).length;
        setGrade(`You got ${correctAnswers} out of 9 correct!`);
        setPracticeTest([]);
      } else {
        console.error("Error grading practice test:", data.error);
      }
    } catch (error) {
      console.error("Error submitting practice test:", error);
    }
  };

  const regenerateTest = async () => {
    setLoading(true);
    try {
      const storedContent = localStorage.getItem("generatedContent");
      if (!storedContent) {
        console.error("No transcription available to regenerate the test.");
        return;
      }

      const parsedContent = JSON.parse(storedContent);
      const transcription = parsedContent.transcription;

      const response = await fetch("http://localhost:5000/regenerate-practice-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
      });

      const data = await response.json();

      if (response.ok && data.practice_test) {
        const practiceTestData =
          typeof data.practice_test === "string"
            ? JSON.parse(data.practice_test) // Parse stringified JSON
            : data.practice_test; // Use as-is if already an object

        if (practiceTestData.questions) {
          setPracticeTest(practiceTestData.questions);
          setResponses(new Array(practiceTestData.questions.length).fill(null));
          setGradedResults(null);
          setGrade(null);
          console.log("Practice test regenerated successfully.");
        }
      } else {
        console.error("Error regenerating practice test:", data.error);
      }
    } catch (error) {
      console.error("Error regenerating practice test:", error);
    } finally {
      setLoading(false);
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
        }}>

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
          Practice Tests
        </div>

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

          <button
            onClick={regenerateTest}
            className={`regen-test-button ${loading ? "loading" : ""}`}
            style={{
              width: "200px",
              height: "40px",
              marginTop: "0px",
            }}
            disabled={loading}
          >
            {loading ? "Regenerating..." : "Regenerate Test"}
          </button>



          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            Font Type:
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              style={{ padding: "5px" }}
            >
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
              <option value="OpenDyslexic">OpenDyslexic</option>
            </select>
          </label>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
            backgroundColor: "#ebf6ff",
          }}
        >

          {gradedResults ? (
            <div style={{ marginTop: "20px" }}>
              {grade && (
                <div
                  style={{
                    marginBottom: "5px",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#265798",
                  }}
                >
                  {grade}
                </div>
              )}
              <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Graded Results</h2>
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
          ) : practiceTest.length > 0 ? (
            practiceTest.map((question, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Q{index + 1}:</strong> {question.question}
                </p>

                {question.type === "multiple_choice" && question.options && (
                  <div>
                    {question.options.map((option, i) => (
                      <label
                        key={i}
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          marginLeft: "-565px",
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          onChange={() => handleResponseChange(index, option)}
                          style={{
                            transform: "scale(1.35)",
                            marginRight: "-340px",
                            paddingLeft: "0px",
                          }}
                        />
                        <span
                          style={{
                            textAlign: "left",
                            width: "90%",
                            marginLeft: "-285px",
                          }}
                        >
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "true_false" && (
                  <div>
                    <label
                      style={{
                        display: "Block",
                        alignItems: "center",
                        marginBottom: "5px",
                        marginLeft: "-564px",
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="true"
                        onChange={() => handleResponseChange(index, true)}
                        style={{
                          transform: "scale(1.35)",
                          marginRight: "-625px",
                          paddingLeft: "0px",
                        }}
                      />
                      <span style={{ textAlign: "left", width: "90%" }}>True</span>
                    </label>
                    <label
                      style={{
                        display: "block",
                        alignItems: "center",
                        marginBottom: "5px",
                        marginLeft: "-564px",
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="false"
                        onChange={() => handleResponseChange(index, false)}
                        style={{
                          transform: "scale(1.35)",
                          marginRight: "-625px",
                          paddingLeft: "0px",
                        }}
                      />
                      <span style={{ textAlign: "left", width: "90%" }}>False</span>
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
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
        <button
          onClick={handleSubmit}
          className="submit-button"
          style={{
            width: "200px",
          }}
        >
          Submit Test
        </button>
      </div>
      </div>

      <div className="watermark">© 2025 StudyBuddy, Inc.</div>
    </div>
  );
};

export default PracticeTest;
