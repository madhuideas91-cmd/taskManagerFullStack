// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage"; // ⭐ NEW



// ⭐ NEW IMPORTS
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import KanbanBoard from "./components/KanbanBoard";

// ⭐ NEW: Team Page
import TeamPage from "./pages/TeamPage";

// ToastProvider
import { ToastProvider } from "./components/ToastProvider";

const App: React.FC = () => {
  const token = localStorage.getItem("token");

  return (
    <ToastProvider>
      <BrowserRouter>
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <Routes>
            {/* Existing route */}
            <Route
              path="/dashboard"
                  element={token ? <Dashboard /> : <Navigate to="/" replace />}
            />

            <Route path="/calendar" element={<CalendarPage />} />

            {/* ⭐ Projects page */}
            <Route
              path="/Projects"
              element={token ? <Projects /> : <Navigate to="/" replace />}
            />

            {/* ⭐ Teams page */}
            <Route
              path="/Teams"
              element={token ? <TeamPage /> : <Navigate to="/" replace />}
            />

            {/* ✅ ADD THIS */}
              <Route
                path="/reports"
                element={token ? <Reports /> : <Navigate to="/" replace />}
              />

              <Route
                path="/settings"
                element={token ? <SettingsPage /> : <Navigate to="/" replace />}
              />
            {/* ⭐ Admin only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* ⭐ Any logged-in user */}
            <Route
              path="/board"
              element={
                <ProtectedRoute>
                  <KanbanBoard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={<div>Welcome! Please signup or login.</div>}
            />
          </Routes>
        </main>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
