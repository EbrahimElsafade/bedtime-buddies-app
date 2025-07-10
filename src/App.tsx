
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Component to handle language routing
const LanguageRoutes = () => {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Validate language parameter
    const validLanguages = ['en', 'ar', 'fr'];
    if (lang && validLanguages.includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
      
      // Set document direction based on language
      if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = lang;
      }
    } else if (lang && !validLanguages.includes(lang)) {
      // Redirect to default language if invalid language is provided
      navigate('/ar', { replace: true });
    }
  }, [lang, i18n, navigate]);

  return (
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
  );
};

const App = () => {
  useEffect(() => {
    // Set initial direction to RTL for Arabic (default)
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    
    console.log("App initialized");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Redirect root to default language */}
                <Route path="/" element={<Navigate to="/ar" replace />} />
                
                {/* Language-specific routes */}
                <Route path="/:lang/*" element={<LanguageRoutes />} />
                
                {/* Fallback for any unmatched routes */}
                <Route path="*" element={<Navigate to="/ar" replace />} />
              </Routes>
            </TooltipProvider>
          </LanguageProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
