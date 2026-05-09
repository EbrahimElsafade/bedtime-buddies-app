import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useSkillPath } from '@/hooks/useSkillPaths'
import { useCoursesData } from '@/hooks/useCourseData'
import { getLocalized } from '@/utils/getLocalized'

const SkillPathEditor = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: existing } = useSkillPath(id)
  const { data: courses = [] } = useCoursesData()

  const [icon, setIcon] = useState('📚')
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [nameFr, setNameFr] = useState('')
  const [descEn, setDescEn] = useState('')
  const [descAr, setDescAr] = useState('')
  const [descFr, setDescFr] = useState('')
  const [order, setOrder] = useState(0)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setIcon(existing.icon)
      setNameEn(existing.name.en || '')
      setNameAr(existing.name.ar || '')
      setNameFr(existing.name.fr || '')
      setDescEn(existing.description.en || '')
      setDescAr(existing.description.ar || '')
      setDescFr(existing.description.fr || '')
      setOrder(existing.display_order)
      setSelectedCourses(existing.course_ids)
    }
  }, [existing])

  const toggleCourse = (cid: string) => {
    setSelectedCourses((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    )
  }

  const handleSave = async () => {
    if (!nameEn.trim()) {
      toast.error('English name is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        icon,
        name: { en: nameEn, ar: nameAr, fr: nameFr },
        description: { en: descEn, ar: descAr, fr: descFr },
        display_order: order,
      }
      let pathId = id
      if (isEdit && id) {
        const { error } = await supabase.from('skill_paths').update(payload).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('skill_paths')
          .insert(payload)
          .select('id')
          .single()
        if (error) throw error
        pathId = data.id
      }

      // Sync course assignments
      await supabase.from('skill_path_courses').delete().eq('skill_path_id', pathId!)
      if (selectedCourses.length > 0) {
        const rows = selectedCourses.map((cid, idx) => ({
          skill_path_id: pathId!,
          course_id: cid,
          display_order: idx,
        }))
        const { error: insertErr } = await supabase.from('skill_path_courses').insert(rows)
        if (insertErr) throw insertErr
      }

      toast.success(isEdit ? 'Skill path updated' : 'Skill path created')
      qc.invalidateQueries({ queryKey: ['skill-paths'] })
      qc.invalidateQueries({ queryKey: ['skill-path', pathId] })
      navigate('/admin/skill-paths')
    } catch (e) {
      toast.error((e as Error).message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/skill-paths')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Skill Path</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr_120px]">
            <div>
              <Label>Icon (emoji)</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} />
            </div>
            <div>
              <Label>Name (EN) *</Label>
              <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Name (AR)</Label>
              <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            </div>
            <div>
              <Label>Name (FR)</Label>
              <Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Description (EN)</Label>
            <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Description (AR)</Label>
              <Textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} />
            </div>
            <div>
              <Label>Description (FR)</Label>
              <Textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Courses ({selectedCourses.length} selected)</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-muted-foreground">No courses available.</p>
          ) : (
            <div className="grid max-h-96 gap-2 overflow-y-auto md:grid-cols-2">
              {courses.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded border p-2 hover:bg-muted"
                >
                  <Checkbox
                    checked={selectedCourses.includes(c.id)}
                    onCheckedChange={() => toggleCourse(c.id)}
                  />
                  <span className="text-sm">{getLocalized(c, 'title', 'en') || '(untitled)'}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SkillPathEditor
