
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Games from "./pages/Games";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Ensure the default direction is RTL for Arabic
const setInitialDirection = () => {
  document.documentElement.dir = 'rtl'; // Default to RTL for Arabic
  document.documentElement.lang = 'ar'; // Set language to Arabic
};

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    setInitialDirection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider defaultLanguage="ar">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/stories/:storyId" element={<Story />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:courseId" element={<Course />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
