import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Category } from '@/types/course'

const CourseOptions = () => {
  const { t } = useTranslation('admin')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [newCategory, setNewCategory] = useState('')

  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Category[]
    },
  })

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('course_categories')
        .insert({ name })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['course-categories'] })
      setNewCategory('')
      toast({
        title: 'Category Added',
        description: `Category '${data.name}' has been added successfully`,
      })
    },
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('course_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['course-categories'] })
      setEditingCategoryId(null)
      setEditingCategoryName('')
      toast({
        title: 'Category Updated',
        description: `Category '${data.name}' has been updated successfully`,
      })
    },
  })

  // Remove category mutation
  const removeCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('course_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, id) => {
      const category = categories.find(cat => cat.id === id)
      queryClient.invalidateQueries({ queryKey: ['course-categories'] })
      toast({
        title: 'Category Removed',
        description: `Category '${category?.name}' has been removed successfully`,
      })
    },
  })

  const addCategory = () => {
    if (
      newCategory.trim() &&
      !categories.some(cat => cat.name === newCategory.trim())
    ) {
      addCategoryMutation.mutate(newCategory.trim())
    }
  }

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.name)
  }

  const saveEditCategory = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      updateCategoryMutation.mutate({
        id: editingCategoryId,
        name: editingCategoryName.trim(),
      })
    }
  }

  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const removeCategory = (id: string) => {
    removeCategoryMutation.mutate(id)
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Course Options</h1>
        <p className="mt-2 text-muted-foreground">
          Manage course categories and settings for your educational content.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Course Categories
            </CardTitle>
            <CardDescription>
              Manage categories that organize your educational courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add new category (e.g., Science, Math, Language)"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCategory()}
              />
              <Button
                onClick={addCategory}
                size="sm"
                disabled={addCategoryMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {categoriesLoading ? (
              <div className="py-4 text-center">Loading categories...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <div key={category.id}>
                    {editingCategoryId === category.id ? (
                      <div className="flex items-center gap-2 rounded-md border bg-white p-2">
                        <Input
                          value={editingCategoryName}
                          onChange={e => setEditingCategoryName(e.target.value)}
                          className="h-6 text-sm"
                          onKeyPress={e =>
                            e.key === 'Enter' && saveEditCategory()
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={saveEditCategory}
                          disabled={updateCategoryMutation.isPending}
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={cancelEditCategory}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {category.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-blue-500 hover:text-white"
                          onClick={() => startEditCategory(category)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeCategory(category.id)}
                          disabled={removeCategoryMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CourseOptions