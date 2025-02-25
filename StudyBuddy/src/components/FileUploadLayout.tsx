import React from "react";

interface FileUploadLayoutProps {
  children: React.ReactNode;
}

const FileUploadLayout: React.FC<FileUploadLayoutProps> = ({ children }) => {
  return <div className="file-upload-layout">{children}</div>;
};

export default FileUploadLayout;
