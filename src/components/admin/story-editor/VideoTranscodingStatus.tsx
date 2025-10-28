import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2, Video } from 'lucide-react'

interface VideoTranscodingStatusProps {
  sectionId: string
  onComplete?: () => void
}

export const VideoTranscodingStatus = ({
  sectionId,
  onComplete,
}: VideoTranscodingStatusProps) => {
  const [status, setStatus] = useState<'pending' | 'transcoding' | 'completed' | 'failed'>('pending')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Set up real-time subscription
    const channel = supabase
      .channel(`section-${sectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'story_sections',
          filter: `id=eq.${sectionId}`,
        },
        (payload: any) => {
      const { video_status, transcoding_progress, transcoding_error } = payload.new
      setStatus(video_status as 'pending' | 'transcoding' | 'completed' | 'failed')
      setProgress(transcoding_progress || 0)
      setError(transcoding_error)

          if (video_status === 'completed' && onComplete) {
            onComplete()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sectionId, onComplete])

  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from('story_sections')
      .select('video_status, transcoding_progress, transcoding_error')
      .eq('id', sectionId)
      .single()

    if (!error && data) {
      setStatus(data.video_status as 'pending' | 'transcoding' | 'completed' | 'failed')
      setProgress(data.transcoding_progress || 0)
      setError(data.transcoding_error)
    }
  }

  if (status === 'completed') {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Video transcoded successfully
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'failed') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Transcoding failed: {error || 'Unknown error'}
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'transcoding') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Transcoding video... {progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    )
  }

  return (
    <Alert>
      <Video className="h-4 w-4" />
      <AlertDescription>
        Video ready for transcoding
      </AlertDescription>
    </Alert>
  )
}