import { Link } from 'react-router-dom'
import { useIsIOS } from '@/hooks/use-ios-detect'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  navItems: Array<{
    name: string
    path: string
    icon: React.ElementType
    key: string
  }>
  isActive: (path: string) => boolean
}

export const MobileNavigation = ({
  navItems,
  isActive,
}: MobileNavigationProps) => {
  const isIOS = useIsIOS()

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-primary/20 bg-secondary px-2 md:hidden',
        isIOS ? 'h-[4.5rem] pb-6' : 'h-16 pb-2', // Add extra padding for iOS home indicator
      )}
    >
      {navItems.map(item => {
        const ItemIcon = item.icon
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex w-1/5 flex-col items-center justify-center rounded-lg px-2 py-1',
              isActive(item.path) ? 'text-accent' : 'text-primary',
            )}
          >
            <ItemIcon
              className={cn(
                'h-5 w-5',
                isActive(item.path) ? 'text-accent' : 'text-primary',
              )}
            />
            <span className="mt-1 text-xs font-medium">{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
