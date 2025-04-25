import React, { useEffect, useState } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import Flashcard from "../UI/Flashcard";
import useGeneratedContent from "../hooks/useGeneratedContent"; // KEEP this

type FlashcardType = {
  term: string;
  definition: string;
};

const FlashCards: React.FC = () => {
  const content = useGeneratedContent(); // LIVE payload

  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  useEffect(() => {
    window.speechSynthesis.cancel(); // Cancel any lingering TTS

    if (Array.isArray(content?.flashcards)) {
      const formattedFlashcards = content.flashcards.map((fc: any) => ({
        term: fc.question,
        definition: fc.answer,
      }));
      setFlashcards(formattedFlashcards);
      setLoadingMessage("");
      setCurrentIndex(0); // reset to first card
    } else {
      setFlashcards([]);
      setLoadingMessage("No flashcards available.");
    }
  }, [content]); // WATCH content!

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
      {/* Top Header */}
      <div
        style={{
          width: "100%",
          borderBottom: "0.1875rem solid #7ea3dc",
          fontWeight: "bold",
          fontSize: "1.5rem",
          textAlign: "left",
          paddingBottom: "0.375rem",
          marginBottom: "4rem",
          marginTop: "-3rem",
          color: "#264653",
          userSelect: "none",
        }}
      >
        Flashcards
      </div>

      {loadingMessage ? (
        <p>{loadingMessage}</p>
      ) : flashcards.length > 0 && currentCard ? (
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
              style={{ cursor: "pointer" }}
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
              style={{ cursor: "pointer" }}
            />
          </div>

          <p className="card-counter" style={{ marginTop: "1rem" }}>
            {currentIndex + 1} / {flashcards.length}
          </p>
        </>
      ) : (
        <p>No flashcards available.</p>
      )}
      
      <div className="watermark" style={{ marginTop: "2rem" }}>
        © 2025 StudyBuddy, Inc.
      </div>
    </div>
  );
};

export default FlashCards;
