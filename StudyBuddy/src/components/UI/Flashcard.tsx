// components/UI/Flashcard.tsx
import React, { useEffect, useState } from "react";
import "../Styling/Flashcard.css";

type Props = {
  term: string;
  definition: string;
};

const Flashcard: React.FC<Props> = ({ term, definition }) => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false); // reset flip when card changes
  }, [term, definition]);

  return (
    <div className="flashcard" onClick={() => setFlipped(!flipped)}>
      <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
        <div className="front">{term}</div>
        <div className="back">{definition}</div>
      </div>
    </div>
  );
};

export default Flashcard;
