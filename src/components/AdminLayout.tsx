
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Book, Presentation, Home, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const AdminLayout = () => {
  const { logout, user, profile } = useAuth();
  const { t, i18n } = useTranslation('admin');
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  const isActive = (path: string) => location.pathname === path;
  
  useEffect(() => {
    console.log("AdminLayout - Rendered with:", { 
      userId: user?.id,
      profileRole: profile?.role,
      pathname: location.pathname,
      language: i18n.language,
      isRTL
    });
  }, [user, profile, location, i18n.language, isRTL]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar side={isRTL ? "right" : "left"} className="border-r border-border" collapsible="none">
          <SidebarHeader className="flex flex-col">
            <div className="flex items-center justify-between p-4">
              <Link
                to="/admin"
                className="flex items-center text-xl font-bold text-dream-DEFAULT"
              >
                <span>{t('dashboard.title')}</span>
              </Link>
              <LanguageSwitcher />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin")}
                  tooltip={t('navigation.dashboard')}
                >
                  <NavLink to="/admin" className="flex items-center">
                    <Home className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span>{t('navigation.dashboard')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin/users")}
                  tooltip={t('navigation.users')}
                >
                  <NavLink to="/admin/users" className="flex items-center">
                    <Users className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span>{t('navigation.users')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    isActive("/admin/stories") ||
                    location.pathname.startsWith("/admin/stories/")
                  }
                  tooltip={t('navigation.stories')}
                >
                  <NavLink to="/admin/stories" className="flex items-center">
                    <Book className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span>{t('navigation.stories')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Add Story Options submenu */}
              <SidebarMenuItem className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin/stories/options")}
                  tooltip={t('storyOptions.title')}
                >
                  <NavLink to="/admin/stories/options" className="flex items-center">
                    <Settings className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span>{t('storyOptions.title')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    isActive("/admin/courses") ||
                    location.pathname.startsWith("/admin/courses/")
                  }
                  tooltip={t('navigation.courses')}
                >
                  <NavLink to="/admin/courses" className="flex items-center">
                    <Presentation className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span>{t('navigation.courses')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <Separator className="my-2" />
            <div className="flex flex-col gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin/settings")}
                  tooltip={t('navigation.settings')}
                >
                  <NavLink to="/admin/settings" className="flex items-center">
                    <Settings className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span>{t('navigation.settings')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="w-full justify-start"
              >
                <LogOut className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <span>{t('navigation.logout')}</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
