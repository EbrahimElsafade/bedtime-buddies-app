import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { StoryEditorForm } from './story-editor/StoryEditorForm'

const StoryEditor = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['story-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ['story-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_languages')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/stories')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Story' : 'Create New Story'}
          </h1>
        </div>
      </header>

      {categoriesLoading || languagesLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-lg">Loading...</span>
        </div>
      ) : (
        <StoryEditorForm
          categories={categories || []}
          categoriesLoading={categoriesLoading}
          languages={languages || []}
          languagesLoading={languagesLoading}
        />
      )}
    </div>
  )
}

export default StoryEditor
