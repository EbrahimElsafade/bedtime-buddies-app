import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { getLocalized } from '@/utils/getLocalized'
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

type Course = {
  id: string
  title?: string
  description?: string
  description_en?: string
  description_ar?: string
  description_fr?: string
  category: string
  cover_image: string | null
  is_free: boolean
  is_published: boolean
  languages: string[]
  created_at: string
  updated_at: string
  instructor_name?: string
  instructor_name_en?: string
  instructor_name_ar?: string
  instructor_name_fr?: string
  instructor_avatar?: string
  instructor_bio?: string
  instructor_bio_en?: string
  instructor_bio_ar?: string
  instructor_bio_fr?: string
  instructor_expertise?: string[]
  instructor_user_id?: string
  learning_objectives?: string[]
  learning_objectives_en?: string[]
  learning_objectives_ar?: string[]
  learning_objectives_fr?: string[]
}

const Courses = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const { t, i18n } = useTranslation(['admin', 'common'])
  const lang = i18n.language as 'en' | 'ar' | 'fr'
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*')
    if (error) {
      toast.error('Failed to fetch courses')
      throw error
    }

    return data as Course[]
  }

  const {
    data: courses = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: fetchCourses,
  })

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = getLocalized(course, 'title', lang)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      if (filter === 'all') return matchesSearch
      if (filter === 'published') return matchesSearch && course.is_published
      if (filter === 'draft') return matchesSearch && !course.is_published

      return matchesSearch
    })
  }, [courses, searchTerm, filter, lang])

  const handleDeleteClick = (id: string) => {
    setCourseToDelete(id)
  }

  const confirmDelete = async () => {
    if (!courseToDelete) return

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToDelete)

      if (error) throw error

      toast.success('Course deleted successfully')
      refetch()
    } catch (error) {
      logger.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    } finally {
      setCourseToDelete(null)
    }
  }

  const togglePublishStatus = async (course: Course) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !course.is_published })
        .eq('id', course.id)

      if (error) throw error

      toast.success(
        `Course ${course.is_published ? 'unpublished' : 'published'} successfully`,
      )
      refetch()
    } catch (error) {
      logger.error('Error updating course status:', error)
      toast.error('Failed to update course status')
    }
  }

  const columns: ColumnDef<Course>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('admin:courses.courseTitle')} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {getLocalized(row.original, 'title', lang)}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          const aTitle = getLocalized(rowA.original, 'title', lang)
          const bTitle = getLocalized(rowB.original, 'title', lang)
          return aTitle.localeCompare(bTitle)
        },
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('admin:courses.category')} />
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
            <Badge
              variant="default"
              className="bg-primary-foreground hover:bg-primary"
            >
              {t('admin:courses.free')}
            </Badge>
          ) : (
            <Badge
              variant="default"
              className="bg-moon-DEFAULT hover:bg-moon-dark"
            >
              {t('admin:courses.premium')}
            </Badge>
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
          <DataTableColumnHeader column={column} title={t('admin:courses.status')} />
        ),
        cell: ({ row }) =>
          row.original.is_published ? (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {t('admin:courses.published')}
            </Badge>
          ) : (
            <Badge variant="outline">{t('admin:courses.draft')}</Badge>
          ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin:courses.actions')}</span>,
        cell: ({ row }) => {
          const course = row.original
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
                  <DropdownMenuLabel>{t('admin:courses.actions')}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to={`/courses/${course.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> {t('common:view')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/admin/courses/edit/${course.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> {t('admin:courses.edit')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => togglePublishStatus(course)}>
                    {course.is_published ? t('admin:courses.unpublish') : t('admin:courses.publish')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteClick(course.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t('admin:courses.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [lang, t],
  )

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('admin:courses.title')}</h1>
            <p className="text-muted-foreground">
              {t('admin:courses.description')}
            </p>
          </div>
          <Button onClick={() => navigate('/admin/courses/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('admin:courses.addNew')}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('common:all')} {t('admin:courses.title')}</CardTitle>
          <CardDescription>
            {t('common:total')}: {courses.length} | {t('admin:courses.published')}: {courses.filter(c => c.is_published).length}
          </CardDescription>
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
              <Input
                placeholder={t('admin:courses.searchPlaceholder')}
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
                {t('admin:courses.published')}
              </Button>
              <Button
                variant={filter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('draft')}
              >
                {t('admin:courses.draft')}
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
            data={filteredCourses}
            isLoading={isLoading}
            emptyMessage={t('common:noDataFound')}
            loadingMessage={t('common:loading')}
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>{t('admin:courses.delete')}</AlertDialogTitle>
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

export default Courses
