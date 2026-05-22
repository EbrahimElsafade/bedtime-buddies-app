import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
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
import { useSkillPaths } from '@/hooks/useSkillPaths'
import { getMultilingualText } from '@/utils/multilingualUtils'
import MaterialIcon from '@/components/ui/MaterialIcon'

const AdminSkillPaths = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: paths = [], isLoading } = useSkillPaths()
  const [toDelete, setToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!toDelete) return
    const { error } = await supabase.from('skill_paths').delete().eq('id', toDelete)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Skill path deleted')
      qc.invalidateQueries({ queryKey: ['skill-paths'] })
    }
    setToDelete(null)
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skill Paths</h1>
          <p className="text-muted-foreground">Manage learning paths and the courses inside them.</p>
        </div>
        <Button onClick={() => navigate('/admin/skill-paths/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Skill Path
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All Skill Paths ({paths.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : paths.length === 0 ? (
            <p className="text-muted-foreground">No skill paths yet.</p>
          ) : (
            <div className="grid gap-4">
              {paths.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{p.icon}</span>
                    <div>
                      <p className="font-semibold">
                        {getMultilingualText(p.name, 'en', 'en') || '(untitled)'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {p.course_ids.length} courses
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/skill-paths/edit/${p.id}`}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setToDelete(p.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete skill path?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the skill path and remove its course assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminSkillPaths
