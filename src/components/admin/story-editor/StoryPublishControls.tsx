import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface StoryPublishControlsProps {
  duration: number
  isFree: boolean
  isPublished: boolean
  onDurationChange: (duration: number) => void
  onFreeChange: (isFree: boolean) => void
  onPublishedChange: (isPublished: boolean) => void
}

export const StoryPublishControls = ({
  duration,
  isFree,
  isPublished,
  onDurationChange,
  onFreeChange,
  onPublishedChange,
}: StoryPublishControlsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={duration}
          onChange={e => onDurationChange(parseInt(e.target.value) || 5)}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is-free">Free Story</Label>
        <Switch
          id="is-free"
          checked={isFree}
          onCheckedChange={onFreeChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is-published">Published</Label>
        <Switch
          id="is-published"
          checked={isPublished}
          onCheckedChange={onPublishedChange}
        />
      </div>
    </div>
  )
}