
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import Games from "./pages/Games";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminStories from "./pages/admin/Stories";
import AdminStoryEditor from "./pages/admin/StoryEditor";
import AdminStoryOptions from "./pages/admin/StoryOptions";
import AdminCourses from "./pages/admin/Courses";
import AdminSettings from "./pages/admin/Settings";
import AdminAppearance from "./pages/admin/Appearance";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./i18n";

// Ensure the default direction is RTL for Arabic
const setInitialDirection = () => {
  document.documentElement.dir = 'rtl'; // Default to RTL for Arabic
  document.documentElement.lang = 'ar'; // Set language to Arabic
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    setInitialDirection();
    
    // Add logging to help with debugging
    console.log("App initialized");

    // Set document direction based on language
    const handleLanguageChange = (lng: string) => {
      if (lng === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = lng;
      }
    };

    // Set initial direction
    handleLanguageChange(i18n.language);

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
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
              
              {/* Admin Routes - wrapped in AdminRoute component for auth checks */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="stories" element={<AdminStories />} />
                  <Route path="stories/new" element={<AdminStoryEditor />} />
                  <Route path="stories/edit/:id" element={<AdminStoryEditor />} />
                  <Route path="stories/options" element={<AdminStoryOptions />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="appearance" element={<AdminAppearance />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
