import React from "react";

interface TextDisplayProps {
  title: string;
  content: string;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ title, content }) => {
  return (
    <div className="text-display">
      <h2 className="text-display-title">{title}</h2>
      <p className="text-display-content">{content}</p>
    </div>
  );
};

export default TextDisplay;
