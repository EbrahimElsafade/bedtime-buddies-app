
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CountryProvider, useCountry } from "@/contexts/CountryContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import AdminRoute from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";

import { GlobalLoader } from "@/components/GlobalLoader";

import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Games from "./pages/Games";
import GamePage from "./pages/GamePage";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import CourseLessons from "./pages/CourseLessons";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Subscription from "./pages/Subscription";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import SkillPathsPage from "./pages/SkillPaths";
import SkillPathDetails from "./pages/SkillPathDetails";
import Status from "./pages/Status";

// Code-split admin routes — they are only used by a small subset of users
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminStories = lazy(() => import("./pages/admin/Stories"));
const AdminStoryEditor = lazy(() => import("./pages/admin/StoryEditor"));
const AdminStoryOptions = lazy(() => import("./pages/admin/StoryOptions"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminCourses = lazy(() => import("./pages/admin/Courses"));
const AdminCourseOptions = lazy(() => import("./pages/admin/CourseOptions"));
const AdminCoursesEditor = lazy(() => import("./pages/admin/CourseEditor"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminSkillPaths = lazy(() => import("./pages/admin/SkillPaths"));
const AdminSkillPathEditor = lazy(() => import("./pages/admin/SkillPathEditor"));
const GamesManagement = lazy(() => import("./pages/admin/GamesManagement"));
const SpecialistRequests = lazy(() => import("./pages/admin/SpecialistRequests"));

const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

function App() {

  

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <LanguageProvider>
          <AuthProvider>
            <CountryProvider>
             
              <LoadingProvider>
                <TooltipProvider>
                  <HelmetProvider>
                    <Toaster />
                  <GlobalLoader />
                  <BrowserRouter>
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
                    <Route path="courses/:id/lessons" element={<CourseLessons />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="skill-paths" element={<SkillPathsPage />} />
                    <Route path="skill-path/:id" element={<SkillPathDetails />} />
                    <Route path="status" element={<Status />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <AdminLayout />
                        </Suspense>
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
                    <Route path="skill-paths" element={<AdminSkillPaths />} />
                    <Route path="skill-paths/new" element={<AdminSkillPathEditor />} />
                    <Route path="skill-paths/edit/:id" element={<AdminSkillPathEditor />} />
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
            </CountryProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
