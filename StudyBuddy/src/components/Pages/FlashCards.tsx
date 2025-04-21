import React, { useEffect, useState } from "react";
import useGeneratedContent from "../hooks/useGeneratedContent";      // ← keep
import Flashcard from "../UI/Flashcard";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

type FlashcardType = { term: string; definition: string };

const FlashCards: React.FC = () => {
  const content = useGeneratedContent();          // LIVE payload
  const [flashcards,   setFlashcards]   = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMsg,   setLoadingMsg]   = useState("Loading…");

  /* refresh when content changes ------------------------------------ */
  useEffect(() => {
    if (Array.isArray(content?.flashcards)) {
      const formatted = content.flashcards.map(fc => ({
        term:        fc.question,
        definition:  fc.answer,
      }));
      setFlashcards(formatted);
      setLoadingMsg("");
      setCurrentIndex(0);                       // reset to first card
    } else {
      setFlashcards([]);
      setLoadingMsg("No flashcards available.");
    }
  }, [content]);                                // ← dependency!

  /* ---------------------------------------------------------------- */
  const goPrev = () => setCurrentIndex(i => (i > 0 ? i - 1 : flashcards.length - 1));
  const goNext = () => setCurrentIndex(i => (i < flashcards.length - 1 ? i + 1 : 0));
  const current = flashcards[currentIndex];

  return (
    <div className="flashcards-container" style={{ textAlign: "center", padding: "2rem" }}>
      {loadingMsg ? (
        <p>{loadingMsg}</p>
      ) : (
        <>
          <div
            className="flashcard-wrapper"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}
          >
            <ArrowLeftCircle size={48} strokeWidth={2.5} onClick={goPrev}  className="arrow-icon" />
            <Flashcard term={current.term} definition={current.definition} key={currentIndex} />
            <ArrowRightCircle size={48} strokeWidth={2.5} onClick={goNext} className="arrow-icon" />
          </div>
          <p style={{ marginTop: "1rem" }}>{currentIndex + 1} / {flashcards.length}</p>
        </>
      )}
      <div className="watermark">© 2025 StudyBuddy, Inc.</div>
    </div>
  );
};

export default FlashCards;