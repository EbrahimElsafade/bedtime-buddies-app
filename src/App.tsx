
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import AdminRoute from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { GlobalLoader } from "@/components/GlobalLoader";

import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Games from "./pages/Games";
import GamePage from "./pages/GamePage";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import CourseLessons from "./pages/CourseLessons";
import CourseCertificate from "./pages/CourseCertificate";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Subscription from "./pages/Subscription";
import ResetPassword from "./pages/ResetPassword";
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
import GamesManagement from "./pages/admin/GamesManagement";
import SpecialistRequests from "./pages/admin/SpecialistRequests";

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
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="stories" element={<Stories />} />
                    <Route path="stories/:id" element={<Story />} />
                    <Route path="games" element={<Games />} />
                    <Route path="games/:gameId" element={<GamePage />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:id" element={<Course />} />
                    <Route path="courses/:id/lessons" element={<ProtectedRoute><CourseLessons /></ProtectedRoute>} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
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
                    <Route path="games-management" element={<GamesManagement />} />
                    <Route path="specialist-requests" element={<SpecialistRequests />} />
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
