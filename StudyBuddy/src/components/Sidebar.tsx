import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add("sb-expanded");
    } else {
      document.body.classList.remove("sb-expanded");
    }
  }, [isExpanded]);

  return (
    <div>
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
                <span>Tests</span>
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
                <i className="bx bx-chevron-right"></i>
                <span>Collapse</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;