import React from "react";
import { Button } from "./ui/Button";
import { Home, Settings, Notebook, ClipboardList, Layers, ChevronRight } from "lucide-react"; // Import icons

import { useState } from "react";
import "./SidebarStyle.css";

// Dynamically import the external CSS file
const loadExternalCSS = (url: string) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
};

// Load the boxicons CSS
loadExternalCSS("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={isExpanded ? "sb-expanded" : ""}>
      <aside>
        <nav>
          <ul>
            <li>
              <a href="#">
                <i className="bx bx-home-circle"></i>
                <span>Profile</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="bx bx-cog"></i>
                <span>Settings</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="bx bx-book"></i>
                <span>Notes</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="bx bx-test-tube"></i>
                <span>Practice Tests</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="bx bx-note"></i>
                <span>Flashcards</span>
              </a>
            </li>
            
            <li>
              <a href="#" onClick={toggleSidebar}>
                <i className="bx bxs-chevron-right"></i>
                <span>Collapse</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main></main>
    </div>
  );
};

export default Sidebar;