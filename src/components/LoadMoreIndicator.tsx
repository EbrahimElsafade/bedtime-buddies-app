import { memo } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LoadMoreIndicatorProps {
  isLoading: boolean
  hasMore: boolean
  loadedCount: number
  totalCount: number
}

export const LoadMoreIndicator = memo(function LoadMoreIndicator({
  isLoading,
  hasMore,
  loadedCount,
  totalCount,
}: LoadMoreIndicatorProps) {
  const { t } = useTranslation('common')

  if (!hasMore && totalCount > 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {t('pagination.showingAll', { 
          count: totalCount,
          defaultValue: `Showing all ${totalCount} items`
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          {t('loading.more', { defaultValue: 'Loading more...' })}
        </span>
      </div>
    )
  }

  if (hasMore) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {t('pagination.scrollForMore', {
          loaded: loadedCount,
          total: totalCount,
          defaultValue: `Showing ${loadedCount} of ${totalCount} - scroll for more`
        })}
      </div>
    )
  }

  return null
})
