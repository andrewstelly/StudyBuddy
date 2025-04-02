// components/Pages/FlashCards.tsx
import React, { useEffect, useState } from "react";
import Flashcard from "../UI/Flashcard";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

type FlashcardType = {
  term: string;
  definition: string;
};

const FlashCards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  useEffect(() => {
    const storedContent = localStorage.getItem("generatedContent");
    if (storedContent) {
      try {
        const parsedContent = JSON.parse(storedContent);
        const flashcardsData = parsedContent.flashcards;

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
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flashcards-container" style={{ textAlign: "center", padding: "2rem" }}>
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
    </div>
  );
};

export default FlashCards;
