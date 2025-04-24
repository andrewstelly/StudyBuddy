import React from "react";

interface PageLayoutProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const FlashcardLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="page-layout">
      <header className="header">
        <h1>{title}</h1>
      </header>
      <div className="flashcard-content">
        <div>{children}</div> {/* This is important for .flashcard-content > div CSS */}
      </div>
    </div>
  );
};

export default FlashcardLayout;
