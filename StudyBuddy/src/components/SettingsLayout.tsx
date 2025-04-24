import React from "react";

interface PageLayoutProps {
  title?: React.ReactNode; // Accept JSX, not just string
  children: React.ReactNode;
}

const SettingsPageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="page-layout">
      <header className="header">
        <h1>{title ?? "StudyBuddy"}</h1>
      </header>
      <div className="settings-content">
        {children}
      </div>
    </div>
  );
};

export default SettingsPageLayout;
