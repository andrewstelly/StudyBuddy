import React from "react";
import { Button } from "./UI/Button"; // Adjust the import path as needed

const Sidebar: React.FC = () => {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white p-5 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">StudyBuddyAI</h2>
      <div className="flex flex-col space-y-4">
        <Button variant="outline" className="w-full justify-start cursor-pointer" onClick={() => console.log("Profile button clicked")}>
          Profile
        </Button>
        <Button variant="outline" className="w-full justify-start cursor-pointer" onClick={() => console.log("Settings button clicked")}>
          Settings
        </Button>
        <Button variant="outline" className="w-full justify-start cursor-pointer" onClick={() => console.log("Notes button clicked")}>
          Notes
        </Button>
        <Button variant="outline" className="w-full justify-start cursor-pointer" onClick={() => console.log("Practice Tests button clicked")}>
          Practice Tests
        </Button>
        <Button variant="outline" className="w-full justify-start cursor-pointer" onClick={() => console.log("Flash Cards button clicked")}>
          Flash Cards
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
