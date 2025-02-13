import React from "react";
import Sidebar from "./components/Sidebar";
import FileUpload from "./components/FileUpload";
import "./styles.css";

function App() {
  return (
    <div>
      {/* Sidebar container */}
      <div className="sidebar-container">
        <Sidebar />
      </div>

      {/* Main container offset by the sidebar width */}
      <div className="main-container">
        <div className="center-page">
          <div>
            <h1>File Upload</h1>
            <FileUpload />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
