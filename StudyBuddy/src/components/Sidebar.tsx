import React from "react";
import { Button } from "./UI/Button"; // Adjust the import path as needed
import { Home, Settings, Notebook, ClipboardList, Layers } from "lucide-react"; // Import icons

const Sidebar: React.FC = () => {
  return (
    <div>
      <h2>StudyBuddyAI</h2>
      
      <div className="flex flex-col space-y-2">
        <Button className="w-full justify-start" onClick={() => console.log("Profile button clicked")}>
          <Home className="mr-2" size={20} />
          Profile
        </Button>
        <Button className="w-full justify-start" onClick={() => console.log("Settings button clicked")}>
          <Settings className="mr-2" size={20} />
          Settings
        </Button>
        <Button className="w-full justify-start" onClick={() => console.log("Notes button clicked")}>
          <Notebook className="mr-2" size={20} />
          Notes
        </Button>
        <Button className="w-full justify-start" onClick={() => console.log("Practice Tests button clicked")}>
          <ClipboardList className="mr-2" size={20} />
          Practice Tests
        </Button>
        <Button className="w-full justify-start" onClick={() => console.log("Flash Cards button clicked")}>
          <Layers className="mr-2" size={20} />
          Flash Cards
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
