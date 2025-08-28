
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import AdminRoute from "@/components/AdminRoute";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

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
import AdminSettings from "./pages/admin/Settings";
import AdminAppearance from "./pages/admin/Appearance";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <PWAInstallPrompt />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes with Layout */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="stories" element={<Stories />} />
                    <Route path="stories/:id" element={<Story />} />
                    <Route path="games" element={<Games />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:id" element={<Course />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="favorites" element={<Favorites />} />
                    <Route path="subscription" element={<Subscription />} />
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
                    <Route path="stories/:id/edit" element={<AdminStoryEditor />} />
                    <Route path="stories/:id/options" element={<AdminStoryOptions />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="appearance" element={<AdminAppearance />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
