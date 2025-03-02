import React from "react";
import { Routes, Route } from "react-router-dom";
import FileUpload from "../FileUpload";
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
      <Route path="/home" element={<FileUploadLayout><FileUpload /></FileUploadLayout>} />
      <Route path="/notes" element={<PageLayout title="Notes"><Notes /></PageLayout>} />
      <Route path="/practice-tests" element={<PageLayout title="Practice Tests"><PracticeTests /></PageLayout>} />
      <Route path="/flash-cards" element={<PageLayout title="Flash Cards"><FlashCards /></PageLayout>} />
      <Route path="/settings" element={<PageLayout title="Settings"><Settings /></PageLayout>} />
    </Routes>
  );
};

export default Navigation;