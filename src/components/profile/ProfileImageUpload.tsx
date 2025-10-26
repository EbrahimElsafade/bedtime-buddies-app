import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Upload, Loader2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const ProfileImageUpload = () => {
  const { user, profile, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(profile?.profile_image || '')

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or WebP)')
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('Image must be less than 5MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/avatar-${Date.now()}.${fileExt}`
      
      // Delete old image if exists
      if (profile?.profile_image) {
        const oldPath = profile.profile_image.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('profile-images')
            .remove([`${user?.id}/${oldPath}`])
        }
      }

      // Upload new image
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      // Update profile
      await updateProfile({ profile_image: publicUrl })
      setImageUrl(publicUrl)
      toast.success('Profile image updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={imageUrl} alt={profile?.parent_name} />
        <AvatarFallback>
          <User className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>
      
      <div>
        <input
          type="file"
          id="profile-image"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <Button
          onClick={() => document.getElementById('profile-image')?.click()}
          disabled={uploading}
          variant="outline"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </>
          )}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          JPEG, PNG or WebP (max 5MB)
        </p>
      </div>
    </div>
  )
}
