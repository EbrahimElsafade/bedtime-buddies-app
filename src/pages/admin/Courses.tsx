import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  ArrowUpDown,
  MoreHorizontal,
  Search,
  PlusCircle,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { getLocalized } from '@/utils/getLocalized'

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
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [sortField, setSortField] = useState<keyof Course>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'
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

  const toggleSort = (field: keyof Course) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = getLocalized(course, 'title', lang)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      if (filter === 'all') return matchesSearch
      if (filter === 'published') return matchesSearch && course.is_published
      if (filter === 'draft') return matchesSearch && !course.is_published

      return matchesSearch
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null) return sortDirection === 'asc' ? -1 : 1
      if (bValue === null) return sortDirection === 'asc' ? 1 : -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue)
      }

      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        return sortDirection === 'asc'
          ? aValue.length - bValue.length
          : bValue.length - aValue.length
      }

      return 0
    })

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
      console.error('Error deleting course:', error)
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
      console.error('Error updating course status:', error)
      toast.error('Failed to update course status')
    }
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('courses.title')}</h1>
            <p className="text-muted-foreground">
              {t('courses.manageAll')}
            </p>
          </div>
          <Button onClick={() => navigate('/admin/courses/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('courses.addNew')}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('courses.allCourses')}</CardTitle>
          <CardDescription>
            {t('courses.total')}: {courses.length} {t('courses.courses')} | {t('courses.published')}:{' '}
            {courses.filter(c => c.is_published).length} {t('courses.courses')}
          </CardDescription>
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('courses.searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('published')}
              >
                Published
              </Button>
              <Button
                variant={filter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('draft')}
              >
                {t('courses.draft')}
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
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => toggleSort('title')}
                    className="cursor-pointer"
                  >
                    Title
                    {sortField === 'title' && (
                      <ArrowUpDown className="ml-2 inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort('category')}
                    className="cursor-pointer"
                  >
                    Category
                    {sortField === 'category' && (
                      <ArrowUpDown className="ml-2 inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort('is_free')}
                    className="cursor-pointer"
                  >
                    Type
                    {sortField === 'is_free' && (
                      <ArrowUpDown className="ml-2 inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort('languages')}
                    className="hidden cursor-pointer md:table-cell"
                  >
                    Languages
                    {sortField === 'languages' && (
                      <ArrowUpDown className="ml-2 inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort('is_published')}
                    className="cursor-pointer"
                  >
                    Status
                    {sortField === 'is_published' && (
                      <ArrowUpDown className="ml-2 inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      {t('admin:loading.courses')}
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {getLocalized(course, 'title', lang)}
                      </TableCell>
                      <TableCell>
                        {course.category.charAt(0).toUpperCase() +
                          course.category.slice(1)}
                      </TableCell>
                      <TableCell>
                        {course.is_free ? (
                          <Badge
                            variant="default"
                            className="bg-primary-foreground hover:bg-primary"
                          >
                            Free
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-moon-DEFAULT hover:bg-moon-dark"
                          >
                            Premium
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {course.languages.map(lang => (
                          <Badge key={lang} variant="outline" className="mr-1">
                            {lang}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {course.is_published ? (
                          <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t('courses.published')}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{t('courses.draft')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-label="Open menu"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/courses/${course.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/courses/edit/${course.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => togglePublishStatus(course)}
                            >
                              {course.is_published ? 'Unpublish' : 'Publish'}{' '}
                              Course
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(course.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {t('courses.showing')} {filteredCourses.length} {t('courses.of')} {courses.length} {t('courses.courses')}
          </p>
        </CardFooter>
      </Card>

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Delete Course</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Courses
