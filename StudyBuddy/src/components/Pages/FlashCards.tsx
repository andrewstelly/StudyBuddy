import React, { useEffect, useState } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import Flashcard from "../UI/Flashcard";

type FlashcardType = {
  term: string;
  definition: string;
};

const FlashCards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  useEffect(() => {
    // Cancel any lingering TTS
    window.speechSynthesis.cancel();

    const storedContent = localStorage.getItem("generatedContent");
    if (storedContent) {
      try {
        const parsedContent = JSON.parse(storedContent);

        // Check if flashcards is a string and parse it if necessary
        const flashcardsData =
          typeof parsedContent.flashcards === "string"
            ? JSON.parse(parsedContent.flashcards) // Parse stringified JSON
            : parsedContent.flashcards; // Use as-is if already an object

        if (Array.isArray(flashcardsData)) {
          const formattedFlashcards = flashcardsData.map((fc: any) => ({
            term: fc.question,
            definition: fc.answer,
          }));
          setFlashcards(formattedFlashcards);
          setLoadingMessage("");
        } else {
          setLoadingMessage("No flashcards available.");
        }
      } catch (e) {
        console.error("Error parsing flashcards:", e);
        setLoadingMessage("Error loading flashcards.");
      }
    } else {
      setLoadingMessage("No flashcards available.");
    }
  }, []);

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : flashcards.length - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < flashcards.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div
      className="flashcards-container"
      style={{ textAlign: "center", padding: "2rem", userSelect: "none" }}
    >
      <div
        style={{
          borderBottom: "3px solid #7ea3dc",
          fontWeight: "bold",
          fontSize: "24px",
          textAlign: "left",
          paddingBottom: "6px",
          marginBottom: "40px",
          color: "#264653",
          userSelect: "none",
        }}
      >
        Flashcards
      </div>

      {loadingMessage ? (
        <p>{loadingMessage}</p>
      ) : (
        <>
          <div
            className="flashcard-wrapper"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
            }}
          >
            <ArrowLeftCircle
              size={48}
              strokeWidth={2.5}
              onClick={goToPrevious}
              className="arrow-icon"
            />
            <Flashcard
              term={currentCard.term}
              definition={currentCard.definition}
              key={currentIndex}
            />
            <ArrowRightCircle
              size={48}
              strokeWidth={2.5}
              onClick={goToNext}
              className="arrow-icon"
            />
          </div>

          <p className="card-counter" style={{ marginTop: "1rem" }}>
            {currentIndex + 1} / {flashcards.length}
          </p>
        </>
      )}
      <div className="watermark">© 2025 StudyBuddy, Inc.</div>
    </div>
  );
};

export default FlashCards;
