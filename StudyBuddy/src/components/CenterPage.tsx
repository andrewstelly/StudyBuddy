import React from "react";

interface CenterPageProps {
  children: React.ReactNode;
}

const CenterPage: React.FC<CenterPageProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default CenterPage;
