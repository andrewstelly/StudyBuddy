import { useState, useEffect } from "react";

export interface GeneratedContent {
  transcription?: string;
  study_guide?: string;
  flashcards?: { question: string; answer: string }[];
  practice_test?: { questions: any[] };
}

export default function useGeneratedContent(): GeneratedContent | null {
  const read = (): GeneratedContent | null => {
    const raw = localStorage.getItem("generatedContent");
    return raw ? JSON.parse(raw) : null;
  };

  const [data, setData] = useState<GeneratedContent | null>(read);

  useEffect(() => {
    const handler = () => setData(read());

    // ❶ custom event from FileUpload  (same‑page updates)
    window.addEventListener("generatedContentUpdated", handler);
    // ❷ native 'storage' event (other tabs / dev tools)
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("generatedContentUpdated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return data;
}