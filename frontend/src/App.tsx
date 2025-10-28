import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Landing from "./pages/Landing";
import ProfileCreate from "./pages/ProfileCreate";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import GameStats from "./pages/GameStats";
import TrainingStats from "./pages/TrainingStats";
import Insights from "./pages/Insights";
import Share from "./pages/Share";
import SharedReport from "./pages/SharedReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Get Google Client ID from environment variable or use placeholder
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/profile/create" element={
              <ProtectedRoute>
                <ProfileCreate />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requireProfile>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute requireProfile>
                <Layout><Goals /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requireProfile>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/stats/games" element={
              <ProtectedRoute requireProfile>
                <Layout><GameStats /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/stats/training" element={
              <ProtectedRoute requireProfile>
                <Layout><TrainingStats /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <ProtectedRoute requireProfile>
                <Layout><Insights /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/share" element={
              <ProtectedRoute requireProfile>
                <Layout><Share /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/report/:token" element={<SharedReport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;