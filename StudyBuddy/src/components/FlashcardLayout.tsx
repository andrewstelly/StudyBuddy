import React from "react";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="page-layout">
      <header className="header">
        <h1>{"StudyBuddy"}</h1>
      </header>
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;