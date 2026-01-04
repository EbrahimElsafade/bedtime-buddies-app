import { Link, NavLink, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Users,
  Book,
  Presentation,
  Home,
  Settings,
  LogOut,
  Palette,
  Gamepad2,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

const AdminLayout = () => {
  const { logout } = useAuth()
  const { t } = useTranslation('admin')
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const isRTL = document.documentElement.lang === 'ar'

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar
          side={isRTL ? 'right' : 'left'}
          className="border-r border-border"
          collapsible="none"
        >
          <SidebarHeader className="flex flex-col">
            <div className="flex items-center justify-between p-4">
              <Link
                to="/admin"
                className="text-primary flex items-center text-xl font-bold"
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
                  isActive={isActive('/admin')}
                  tooltip={t('navigation.dashboard')}
                >
                  <NavLink to="/admin" className="flex items-center">
                    <Home className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('navigation.dashboard')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/users')}
                  tooltip={t('navigation.users')}
                >
                  <NavLink to="/admin/users" className="flex items-center">
                    <Users className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('navigation.users')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    isActive('/admin/stories') ||
                    location.pathname.startsWith('/admin/stories/')
                  }
                  tooltip={t('navigation.stories')}
                >
                  <NavLink to="/admin/stories" className="flex items-center">
                    <Book className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('navigation.stories')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Add Story Options submenu */}
              <SidebarMenuItem className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/stories/options')}
                  tooltip={t('storyOptions.title')}
                >
                  <NavLink
                    to="/admin/stories/options"
                    className="flex items-center"
                  >
                    <Settings className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('storyOptions.title')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    isActive('/admin/courses') ||
                    location.pathname.startsWith('/admin/courses/')
                  }
                  tooltip={t('navigation.courses')}
                >
                  <NavLink to="/admin/courses" className="flex items-center">
                    <Presentation className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('navigation.courses')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/courses/options')}
                  tooltip={t('courseOptions.title')}
                >
                  <NavLink
                    to="/admin/courses/options"
                    className="flex items-center"
                  >
                    <Settings className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('courseOptions.title')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/games-management')}
                  tooltip={t('nav.games')}
                >
                  <NavLink to="/admin/games-management" className="flex items-center">
                    <Gamepad2 className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('nav.games')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/specialist-requests')}
                  tooltip={t('navigation.specialistRequests')}
                >
                  <NavLink to="/admin/specialist-requests" className="flex items-center">
                    <MessageSquare className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('navigation.specialistRequests')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/appearance')}
                  tooltip={t('navigation.appearance')}
                >
                  <NavLink to="/admin/appearance" className="flex items-center">
                    <Palette className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('navigation.appearance')}</span>
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
                  isActive={isActive('/admin/settings')}
                  tooltip={t('navigation.settings')}
                >
                  <NavLink to="/admin/settings" className="flex items-center">
                    <Settings className="mr-3 h-5 w-5 rtl:ml-3" />
                    <span>{t('navigation.settings')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="w-full justify-start"
              >
                <LogOut className="mr-3 h-5 w-5 rtl:ml-3" />
                <span>{t('navigation.logout')}</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout
