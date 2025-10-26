
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import AdminRoute from "@/components/AdminRoute";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { GlobalLoader } from "@/components/GlobalLoader";

import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Games from "./pages/Games";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStories from "./pages/admin/Stories";
import AdminStoryEditor from "./pages/admin/StoryEditor";
import AdminStoryOptions from "./pages/admin/StoryOptions";
import AdminUsers from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import AdminCourseOptions from "./pages/admin/CourseOptions";
import AdminCoursesEditor from "./pages/admin/CourseEditor";
import AdminSettings from "./pages/admin/Settings";
import AdminAppearance from "./pages/admin/Appearance";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <LanguageProvider>
          <AuthProvider>
            <LoadingProvider>
              <TooltipProvider>
                <HelmetProvider>
                  <Toaster />
                  <GlobalLoader />
                  <BrowserRouter>
                  <PWAInstallPrompt />
                <Routes>
                  {/* Public Routes with Layout */}
                  <Route path="/" element={<ErrorBoundary><Layout /></ErrorBoundary>}>
                    <Route index element={<ErrorBoundary><Index /></ErrorBoundary>} />
                    <Route path="stories" element={<ErrorBoundary><Stories /></ErrorBoundary>} />
                    <Route path="stories/:id" element={<ErrorBoundary><Story /></ErrorBoundary>} />
                    <Route path="games" element={<ErrorBoundary><Games /></ErrorBoundary>} />
                    <Route path="courses" element={<ErrorBoundary><Courses /></ErrorBoundary>} />
                    <Route path="courses/:id" element={<ErrorBoundary><Course /></ErrorBoundary>} />
                    <Route path="login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                    <Route path="register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
                    <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
                    <Route path="favorites" element={<ErrorBoundary><Favorites /></ErrorBoundary>} />
                    <Route path="subscription" element={<ErrorBoundary><Subscription /></ErrorBoundary>} />
                  </Route>

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ErrorBoundary>
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      </ErrorBoundary>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="stories" element={<AdminStories />} />
                    <Route path="stories/new" element={<AdminStoryEditor />} />
                    <Route path="stories/edit/:id" element={<AdminStoryEditor />} />
                    <Route path="stories/options" element={<AdminStoryOptions />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="courses/options" element={<AdminCourseOptions />} />
                    <Route path="courses/new" element={<AdminCoursesEditor />} />
                    <Route path="courses/edit/:id" element={<AdminCoursesEditor />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="appearance" element={<AdminAppearance />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
                </HelmetProvider>
              </TooltipProvider>
            </LoadingProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
