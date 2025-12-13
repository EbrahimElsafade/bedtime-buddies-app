import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const SkillsManager = () => {
  const { t } = useTranslation('common')
  const { profile, updateProfile } = useAuth()
  const [newSkill, setNewSkill] = useState('')
  const [saving, setSaving] = useState(false)
  const skills = profile?.skills || []

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    
    if (skills.includes(newSkill.trim())) {
      toast.error('Skill already added')
      return
    }

    try {
      setSaving(true)
      const updatedSkills = [...skills, newSkill.trim()]
      await updateProfile({ skills: updatedSkills })
      setNewSkill('')
      toast.success('Skill added')
    } catch (error) {
      toast.error('Failed to add skill')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveSkill = async (skill: string) => {
    try {
      setSaving(true)
      const updatedSkills = skills.filter(s => s !== skill)
      await updateProfile({ skills: updatedSkills })
      toast.success('Skill removed')
    } catch (error) {
      toast.error('Failed to remove skill')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Skills (For Instructors)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Add your expertise and skills to help students know what you can teach
        </p>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder={t('profile.addSkillPlaceholder')}
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          disabled={saving}
        />
        <Button
          onClick={handleAddSkill}
          disabled={saving || !newSkill.trim()}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="px-3 py-1">
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                disabled={saving}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
