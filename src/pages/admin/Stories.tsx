import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { getMultilingualText } from '@/utils/multilingualUtils'
import { DataTable } from '@/components/admin/DataTable'
import { DataTableColumnHeader } from '@/components/admin/DataTableColumnHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Search,
  PlusCircle,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Story = {
  id: string
  title: Record<string, string>
  description: Record<string, string>
  category: string
  cover_image: string | null
  duration: number
  is_free: boolean
  is_published: boolean
  languages: string[]
  created_at: string
  updated_at: string
}

const Stories = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null)

  const { t, i18n } = useTranslation(['admin', 'common'])

  const fetchStories = async () => {
    const { data, error } = await supabase.from('stories').select('*')
    if (error) {
      toast.error('Failed to fetch stories')
      throw error
    }
    return data as Story[]
  }

  const {
    data: stories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-stories'],
    queryFn: fetchStories,
  })

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const storyTitle = getMultilingualText(story.title, 'en', 'en')
      const matchesSearch = storyTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      if (filter === 'all') return matchesSearch
      if (filter === 'published') return matchesSearch && story.is_published
      if (filter === 'draft') return matchesSearch && !story.is_published

      return matchesSearch
    })
  }, [stories, searchTerm, filter])

  const handleDeleteClick = (id: string) => {
    setStoryToDelete(id)
  }

  const confirmDelete = async () => {
    if (!storyToDelete) return

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyToDelete)

      if (error) throw error

      toast.success('Story deleted successfully')
      refetch()
    } catch (error) {
      logger.error('Error deleting story:', error)
      toast.error('Failed to delete story')
    } finally {
      setStoryToDelete(null)
    }
  }

  const togglePublishStatus = async (story: Story) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_published: !story.is_published })
        .eq('id', story.id)

      if (error) throw error

      toast.success(
        `Story ${story.is_published ? 'unpublished' : 'published'} successfully`,
      )
      refetch()
    } catch (error) {
      logger.error('Error updating story status:', error)
      toast.error('Failed to update story status')
    }
  }

  const columns: ColumnDef<Story>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('admin:stories.storyTitle')} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {getMultilingualText(row.original.title, i18n.language, 'en')}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          const aTitle = getMultilingualText(rowA.original.title, 'en', 'en')
          const bTitle = getMultilingualText(rowB.original.title, 'en', 'en')
          return aTitle.localeCompare(bTitle)
        },
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('admin:stories.category')} />
        ),
        cell: ({ row }) =>
          row.original.category.charAt(0).toUpperCase() +
          row.original.category.slice(1),
      },
      {
        accessorKey: 'is_free',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('common:type')} />
        ),
        cell: ({ row }) =>
          row.original.is_free ? (
            <Badge>{t('admin:stories.free')}</Badge>
          ) : (
            <Badge variant="accent">{t('admin:stories.premium')}</Badge>
          ),
      },
      {
        accessorKey: 'languages',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('common:languages')}
            className="hidden md:table-cell"
          />
        ),
        cell: ({ row }) => (
          <div className="hidden md:block">
            {row.original.languages.map(lang => (
              <Badge key={lang} variant="outline" className="mr-1">
                {lang}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'is_published',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('admin:stories.status')} />
        ),
        cell: ({ row }) =>
          row.original.is_published ? (
            <Badge variant="success">{t('admin:stories.published')}</Badge>
          ) : (
            <Badge variant="outline">{t('admin:stories.draft')}</Badge>
          ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin:stories.actions')}</span>,
        cell: ({ row }) => {
          const story = row.original
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label={t('common:openMenu')}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('admin:stories.actions')}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to={`/stories/${story.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> {t('common:view')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/admin/stories/edit/${story.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> {t('admin:stories.edit')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => togglePublishStatus(story)}>
                    {story.is_published ? t('admin:stories.unpublish') : t('admin:stories.publish')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteClick(story.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t('admin:stories.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [i18n.language, t],
  )

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('admin:stories.title')}</h1>
            <p className="text-muted-foreground">{t('admin:stories.description')}</p>
          </div>
          <Button onClick={() => navigate('/admin/stories/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('admin:stories.addNew')}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('common:all')} {t('admin:stories.title')}</CardTitle>
          <CardDescription>
            {t('common:total')}: {stories.length} | {t('admin:stories.published')}: {stories.filter(s => s.is_published).length}
          </CardDescription>
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
              <Input
                placeholder={t('admin:stories.searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full ps-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                {t('common:all')}
              </Button>
              <Button
                variant={filter === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('published')}
              >
                {t('admin:stories.published')}
              </Button>
              <Button
                variant={filter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('draft')}
              >
                {t('admin:stories.draft')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredStories}
            isLoading={isLoading}
            emptyMessage={t('common:noDataFound')}
            loadingMessage={t('common:loading')}
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={!!storyToDelete}
        onOpenChange={() => setStoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>{t('admin:stories.delete')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {t('admin:forms.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin:forms.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('admin:forms.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Stories
