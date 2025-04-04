import React from "react";

interface FileUploadLayoutProps {
  title: string; // Just like PageLayout
  children: React.ReactNode;
}

const FileUploadLayout: React.FC<FileUploadLayoutProps> = ({ title, children }) => {
  return (
    <div className="file-upload-layout">
      <header className="header">
        <h1>{title}</h1>
      </header>
      <div className="content">{children}</div>
    </div>
  );
};

export default FileUploadLayout;
