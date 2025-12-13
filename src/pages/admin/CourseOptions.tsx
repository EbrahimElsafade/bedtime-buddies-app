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
import { Plus, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Category } from '@/types/course'

const CourseOptions = () => {
  const { t } = useTranslation('admin')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [newCategory, setNewCategory] = useState('')
  const [newCategoryAr, setNewCategoryAr] = useState('')
  const [newCategoryFr, setNewCategoryFr] = useState('')

  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingCategoryNameAr, setEditingCategoryNameAr] = useState('')
  const [editingCategoryNameFr, setEditingCategoryNameFr] = useState('')
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data?.map((categoryData: Record<string, unknown>) => {
        return {
          id: categoryData.id as string,
          name: (categoryData.name_en as string) || (categoryData.name as string) || '',
          name_en: (categoryData.name_en as string) || (categoryData.name as string) || '',
          name_ar: (categoryData.name_ar as string) || '',
          name_fr: (categoryData.name_fr as string) || '',
          description_en: (categoryData.description_en as string) || '',
          description_ar: (categoryData.description_ar as string) || '',
          description_fr: (categoryData.description_fr as string) || '',
          created_at: categoryData.created_at as string,
          updated_at: categoryData.updated_at as string,
        };
      }) || []
    },
  })

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, name_ar, name_fr }: { name: string; name_ar: string; name_fr: string }) => {
      const { data, error } = await supabase
        .from('course_categories')
        .insert({ 
          name,
          name_en: name,
          name_ar,
          name_fr
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['course-categories'] })
      setNewCategory('')
      setNewCategoryAr('')
      setNewCategoryFr('')
      toast({
        title: 'Category Added',
        description: `Category '${data.name}' has been added successfully`,
      })
    },
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name, name_ar, name_fr }: { id: string; name: string; name_ar: string; name_fr: string }) => {
      const { data, error } = await supabase
        .from('course_categories')
        .update({ 
          name,
          name_en: name,
          name_ar,
          name_fr
        })
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
      setEditingCategoryNameAr('')
      setEditingCategoryNameFr('')
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
      addCategoryMutation.mutate({
        name: newCategory.trim(),
        name_ar: newCategoryAr.trim(),
        name_fr: newCategoryFr.trim()
      })
    }
  }

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.name_en || category.name || '')
    setEditingCategoryNameAr(category.name_ar || '')
    setEditingCategoryNameFr(category.name_fr || '')
  }

  const saveEditCategory = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      updateCategoryMutation.mutate({
        id: editingCategoryId,
        name: editingCategoryName.trim(),
        name_ar: editingCategoryNameAr.trim(),
        name_fr: editingCategoryNameFr.trim(),
      })
    }
  }

  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditingCategoryName('')
    setEditingCategoryNameAr('')
    setEditingCategoryNameFr('')
  }

  const handleDeleteCategoryClick = (id: string) => {
    setCategoryToDelete(id)
  }

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return
    removeCategoryMutation.mutate(categoryToDelete)
    setCategoryToDelete(null)
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
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Category name (English)"
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
              {newCategory.trim() && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Category name (Arabic)"
                    value={newCategoryAr}
                    onChange={e => setNewCategoryAr(e.target.value)}
                  />
                  <Input
                    placeholder="Category name (French)"
                    value={newCategoryFr}
                    onChange={e => setNewCategoryFr(e.target.value)}
                  />
                </div>
              )}
            </div>

            {categoriesLoading ? (
              <div className="py-4 text-center">Loading categories...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <div key={category.id}>
                    {editingCategoryId === category.id ? (
                      <div className="space-y-2 rounded-md border bg-secondary p-3">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="English"
                            value={editingCategoryName}
                            onChange={e => setEditingCategoryName(e.target.value)}
                            className="h-8 text-sm"
                            onKeyPress={e =>
                              e.key === 'Enter' && saveEditCategory()
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={saveEditCategory}
                            disabled={updateCategoryMutation.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={cancelEditCategory}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Arabic"
                            value={editingCategoryNameAr}
                            onChange={e => setEditingCategoryNameAr(e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Input
                            placeholder="French"
                            value={editingCategoryNameFr}
                            onChange={e => setEditingCategoryNameFr(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-md border bg-secondary/20 p-2">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="text-sm">
                              EN: {category.name_en || category.name || 'N/A'}
                            </Badge>
                            {category.name_ar && (
                              <Badge variant="outline" className="text-sm">
                                AR: {category.name_ar}
                              </Badge>
                            )}
                            {category.name_fr && (
                              <Badge variant="outline" className="text-sm">
                                FR: {category.name_fr}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-blue-500 hover:text-secondary"
                              onClick={() => startEditCategory(category)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleDeleteCategoryClick(category.id)}
                              disabled={removeCategoryMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
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

export default CourseOptions