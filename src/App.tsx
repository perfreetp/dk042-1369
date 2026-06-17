import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import CreatePage from "@/pages/CreatePage";
import DiagnosePage from "@/pages/DiagnosePage";
import ComparePage from "@/pages/ComparePage";
import ExportPage from "@/pages/ExportPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/diagnose" element={<DiagnosePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="*" element={<Navigate to="/create" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
