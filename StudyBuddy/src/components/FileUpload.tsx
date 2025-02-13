import React, { useState } from "react";

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    console.log("File selected:", selectedFile.name);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {selectedFile && <p>{selectedFile.name}</p>}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;
