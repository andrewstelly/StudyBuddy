import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./UI/Button";
import { Home, Settings, Notebook, ClipboardList, Layers } from "lucide-react"; // Import icons

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar-container">
      <h2>StudyBuddyAI</h2>
      
      <div className="flex flex-col space-y-2">
        <Link to="/">
          <Button className="w-full justify-start">
            <Home className="mr-2" size={20} />
            Home
          </Button>
        </Link>
        <Link to="/notes">
          <Button className="w-full justify-start">
            <Notebook className="mr-2" size={20} />
            Notes
          </Button>
        </Link>
        <Link to="/practice-tests">
          <Button className="w-full justify-start">
            <ClipboardList className="mr-2" size={20} />
            Practice Tests
          </Button>
        </Link>
        <Link to="/flash-cards">
          <Button className="w-full justify-start">
            <Layers className="mr-2" size={20} />
            Flash Cards
          </Button>
        </Link>
        <Link to="/settings">
          <Button className="w-full justify-start">
            <Settings className="mr-2" size={20} />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
