import React from "react";
import { Routes, Route } from "react-router-dom";
import FileUpload from "./FileUpload";
import Settings from "./Settings";
import Notes from "../Pages/Notes";
import PracticeTests from "../Pages/PracticeTests";
import FlashCards from "./FlashCards";
import FileUploadLayout from "../FileUploadLayout";
import PageLayout from "../PageLayout";
import SignIn from "../SignIn";
import SettingsPageLayout from "../SettingsLayout";
import FlashcardLayout from "../FlashcardLayout";

const Navigation: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route
        path="/home"
        element={
          <FileUploadLayout
            title={
              <>
                <img
                  src="/Images/StudyBuddyLogo.png"
                  alt="StudyBuddy Logo"
                  style={{ width: "42px", height: "42px", marginRight: "1px", position: 'relative',
                  top: '8px', left: '8px' }}
                />
                <span style={{ position: "relative", left: "7.8px" }}>StudyBuddy</span>
              </>
            }
          >
            <FileUpload />
          </FileUploadLayout>
        }
      />
      <Route
        path="/notes"
        element={
          <PageLayout
            title={
              <>
                <img
                  src="/Images/StudyBuddyLogo.png"
                  alt="StudyBuddy Logo"
                  style={{ width: "42px", height: "42px", marginRight: "1px", position: 'relative',
                  top: '8px' }}
                />
                StudyBuddy
              </>
            }
          >
            <Notes />
          </PageLayout>
        }
      />
      <Route
        path="/practice-tests"
        element={
          <PageLayout
            title={
              <>
                <img
                  src="/Images/StudyBuddyLogo.png"
                  alt="StudyBuddy Logo"
                  style={{ width: "42px", height: "42px", marginRight: "1px", position: 'relative',
                  top: '8px' }}
                />
                StudyBuddy
              </>
            }
          >
            <PracticeTests />
          </PageLayout>
        }
      />
      <Route
        path="/flash-cards"
        element={
          <FlashcardLayout
            title={
              <>
                <img
                  src="/Images/StudyBuddyLogo.png"
                  alt="StudyBuddy Logo"
                  style={{
                    width: "42px",
                    height: "42px",
                    marginRight: "1px",
                    position: "relative",
                    top: "8px",
                  }}
                />
                StudyBuddy
              </>
            }
          >
            <FlashCards />
          </FlashcardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <SettingsPageLayout
            title={
              <>
                <img
                  src="/Images/StudyBuddyLogo.png"
                  alt="StudyBuddy Logo"
                  style={{
                    width: "42px",
                    height: "42px",
                    marginRight: "1px",
                    position: "relative",
                    top: "8px",
                  }}
                />
                StudyBuddy
              </>
            }
          >
            <Settings />
          </SettingsPageLayout>
        }
      />
    </Routes>
  );
};

export default Navigation;