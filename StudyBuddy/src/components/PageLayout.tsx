import React from "react";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="page-layout">
      <header className="header">
        <h1>{title}</h1>
      </header>
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
