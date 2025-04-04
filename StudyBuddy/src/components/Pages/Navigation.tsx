import React from "react";
import { Routes, Route } from "react-router-dom";
import FileUpload from "./FileUpload";
import Settings from "./Settings";
import Notes from "../Pages/Notes";
import PracticeTests from "../Pages/PracticeTests";
import FlashCards from "../Pages/FlashCards";
import FileUploadLayout from "../FileUploadLayout";
import PageLayout from "../PageLayout";
import SignIn from "../SignIn";

const Navigation: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/home" element={<FileUploadLayout title="StudyBuddy"><FileUpload /></FileUploadLayout>} />
      <Route path="/notes" element={<PageLayout title="StudyBuddy"><Notes /></PageLayout>} />
      <Route path="/practice-tests" element={<PageLayout title="StudyBuddy"><PracticeTests /></PageLayout>} />
      <Route path="/flash-cards" element={<PageLayout title="StudyBuddy"><FlashCards /></PageLayout>} />
      <Route path="/settings" element={<PageLayout title ="StudyBuddy"><Settings /></PageLayout>} />
    </Routes>
  );
};

export default Navigation;