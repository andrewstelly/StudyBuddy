import React from "react";

interface CenterPageProps {
  children: React.ReactNode;
}

const CenterPage: React.FC<CenterPageProps> = ({ children }) => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-200">
      {children}
    </div>
  );
};

export default CenterPage;
