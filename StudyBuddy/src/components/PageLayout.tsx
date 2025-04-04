import React from "react";

interface PageLayoutProps {
  title: string; // Title for the header
  children: React.ReactNode; // Content to render inside the layout
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="page-layout">
      <header className="header">
        <h1>{title}</h1>
      </header>
      <div className="content">{children}</div>
    </div>
  );
};

export default PageLayout;