import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { getMultilingualText } from '@/utils/multilingualUtils'
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
  const [sortField, setSortField] = useState<keyof Story>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null)

  const { i18n } = useTranslation()

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

  const toggleSort = (field: keyof Story) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredStories = stories
    .filter(story => {
      const storyTitle = getMultilingualText(story.title, 'en', 'en')
      const matchesSearch = storyTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      if (filter === 'all') return matchesSearch
      if (filter === 'published') return matchesSearch && story.is_published
      if (filter === 'draft') return matchesSearch && !story.is_published

      return matchesSearch
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null) return sortDirection === 'asc' ? -1 : 1
      if (bValue === null) return sortDirection === 'asc' ? 1 : -1

      // Handle multilingual title sorting
      if (sortField === 'title') {
        const aTitle = getMultilingualText(a.title, 'en', 'en')
        const bTitle = getMultilingualText(b.title, 'en', 'en')
        return sortDirection === 'asc'
          ? aTitle.localeCompare(bTitle)
          : bTitle.localeCompare(aTitle)
      }

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

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        return sortDirection === 'asc'
          ? aValue.length - bValue.length
          : bValue.length - aValue.length
      }

      return 0
    })

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

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stories</h1>
            <p className="text-muted-foreground">Manage all Dolphoon</p>
          </div>
          <Button onClick={() => navigate('/admin/stories/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Story
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Stories</CardTitle>
          <CardDescription>
            Total: {stories.length} stories | Published:{' '}
            {stories.filter(s => s.is_published).length} stories
          </CardDescription>
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
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
                Draft
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
                      Loading stories...
                    </TableCell>
                  </TableRow>
                ) : filteredStories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      No stories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStories.map(story => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">
                        {getMultilingualText(story.title, i18n.language, 'en')}
                      </TableCell>
                      <TableCell>
                        {story.category.charAt(0).toUpperCase() +
                          story.category.slice(1)}
                      </TableCell>
                      <TableCell>
                        {story.is_free ? (
                          <Badge>Free</Badge>
                        ) : (
                          <Badge variant="accent">Premium</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {story.languages.map(lang => (
                          <Badge key={lang} variant="outline" className="mr-1">
                            {lang}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {story.is_published ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
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
                              <Link to={`/stories/${story.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/stories/edit/${story.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => togglePublishStatus(story)}
                            >
                              {story.is_published ? 'Unpublish' : 'Publish'}{' '}
                              Story
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(story.id)}
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
            Showing {filteredStories.length} of {stories.length} stories
          </p>
        </CardFooter>
      </Card>

      <AlertDialog
        open={!!storyToDelete}
        onOpenChange={() => setStoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Delete Story</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be
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

export default Stories
