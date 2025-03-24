import React, { useEffect, useState } from "react";
import "./FlashCards.css"; // Import the CSS file for styling
import TextDisplay from "../TextDisplay";

interface Flashcard {
    question: string;
    answer: string;
}

const FlashCards: React.FC = () => {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0); // Track the current flashcard index
    const [isFlipped, setIsFlipped] = useState<boolean>(false); // Track if the card is flipped
    const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");

    useEffect(() => {
        // Fetch flashcards from localStorage
        const storedContent = localStorage.getItem("generatedContent");
        if (storedContent) {
            try {
                const parsedContent = JSON.parse(storedContent);
                const flashcardsData = parsedContent.flashcards;

                // Check if flashcardsData is an array
                if (Array.isArray(flashcardsData)) {
                    setFlashcards(flashcardsData); // Valid array of flashcards
                    setLoadingMessage(""); // Clear loading message
                } else {
                    setLoadingMessage("No flashcards available.");
                }
            } catch (error) {
                console.error("Error parsing flashcards from localStorage:", error);
                setLoadingMessage("Error loading flashcards.");
            }
        } else {
            setLoadingMessage("No flashcards available.");
        }
    }, []);

    const handleFlip = () => {
        setIsFlipped(!isFlipped); // Toggle the flipped state
    };

    const handleNext = () => {
        setIsFlipped(false); // Reset flip state
        setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length); // Go to the next flashcard
    };

    const handlePrevious = () => {
        setIsFlipped(false); // Reset flip state
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
        ); // Go to the previous flashcard
    };

    return (
        <div>
            <TextDisplay title="Flash Cards" content="Below are your generated flashcards:" />
            {loadingMessage ? (
                <p>{loadingMessage}</p>
            ) : (
                <div className="flashcard-container">
                    <div className="flashcard" onClick={handleFlip}>
                        <div
                            className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}
                        >
                            <div className="flashcard-front">
                                <strong>Question:</strong>
                                <p>{flashcards[currentIndex].question}</p>
                            </div>
                            <div className="flashcard-back">
                                <strong>Answer:</strong>
                                <p>{flashcards[currentIndex].answer}</p>
                            </div>
                        </div>
                    </div>
                    <div className="navigation-buttons">
                        <button onClick={handlePrevious}>&lt; Previous</button>
                        <button onClick={handleNext}>Next &gt;</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashCards;