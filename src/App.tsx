
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Stories from "@/pages/Stories";
import Story from "@/pages/Story";
import Games from "@/pages/Games";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Subscription from "@/pages/Subscription";
import Courses from "@/pages/Courses";
import Course from "@/pages/Course";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/components/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminStories from "@/pages/admin/Stories";
import AdminStoryEditor from "@/pages/admin/StoryEditor";
import AdminStoryOptions from "@/pages/admin/StoryOptions";
import AdminCourses from "@/pages/admin/Courses";
import AdminUsers from "@/pages/admin/Users";
import AdminSettings from "@/pages/admin/Settings";
import AdminAppearance from "@/pages/admin/Appearance";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="stories" element={<Stories />} />
              <Route path="stories/:id" element={<Story />} />
              <Route path="games" element={<Games />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<Course />} />
              <Route path="profile" element={<Profile />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="subscription" element={<Subscription />} />
            </Route>
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="stories" element={<AdminStories />} />
              <Route path="stories/new" element={<AdminStoryEditor />} />
              <Route path="stories/:id/edit" element={<AdminStoryEditor />} />
              <Route path="stories/:id/options" element={<AdminStoryOptions />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="appearance" element={<AdminAppearance />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
