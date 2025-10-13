import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Loader2,
  X,
  Image,
  Video,
} from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'
import { CourseVideo } from '@/types/course'
import { useTranslation } from 'react-i18next'

interface CourseLessonForm extends Omit<CourseVideo, 'id'> {
  id?: string
  thumbnailFile?: File | null
  thumbnailPreview?: string | null
  videoUrl?: string
  videoFiles?: File[] | null
  uploadMethod?: 'url' | 'upload'
}

const CourseEditor = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id
  const { t } = useTranslation(['admin', 'common'])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  )

  // Course form data
  const [courseData, setCourseData] = useState({
    title_en: '',
    title_ar: '',
    title_fr: '',
    description_en: '',
    description_ar: '',
    description_fr: '',
    category: '',
    minAge: 3,
    maxAge: 12,
    isFree: true,
    isFeatured: false,
    coverImagePath: null as string | null,
    learningObjectives: [] as string[],
    learningObjectivesAr: [] as string[],
    learningObjectivesFr: [] as string[],
    instructorNameEn: '',
    instructorNameAr: '',
    instructorNameFr: '',
    instructorBioEn: '',
    instructorBioAr: '',
    instructorBioFr: '',
    instructorAvatar: '',
    instructorUserId: null as string | null,
    instructorType: 'custom' as 'custom' | 'user',
  })
  
  const [instructorAvatarFile, setInstructorAvatarFile] = useState<File | null>(null)
  const [instructorAvatarPreview, setInstructorAvatarPreview] = useState<string | null>(null)

  const [newObjective, setNewObjective] = useState('')
  const [newObjectiveAr, setNewObjectiveAr] = useState('')
  const [newObjectiveFr, setNewObjectiveFr] = useState('')

  // Course lessons/videos
  const [courseLessons, setCourseLessons] = useState<CourseLessonForm[]>([])

  // Fetch categories from database
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  // Fetch users who can be instructors
  const { data: users } = useQuery({
    queryKey: ['users-for-instructors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, parent_name, child_name')
        .order('parent_name')

      if (error) throw error
      return data
    },
  })

  // Fetch course data if editing
  const { data: courseDetails, isLoading } = useQuery({
    queryKey: ['admin-course', id],
    queryFn: async () => {
      if (!isEditing || !id) return null

      console.log('Fetching course for ID:', id)

      // Fetch course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

      if (courseError) {
        console.error('Course fetch error:', courseError)
        toast.error('Failed to fetch course details')
        throw courseError
      }

      // Fetch course lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', id)
        .order('lesson_order', { ascending: true })

      if (lessonsError) {
        console.error('Lessons fetch error:', lessonsError)
        toast.error('Failed to fetch course lessons')
        throw lessonsError
      }

      console.log('Fetched course lessons:', lessons)

      return {
        course,
        lessons: lessons || [],
      }
    },
    enabled: isEditing && !!id && id !== 'new',
    staleTime: Infinity,
  })

  useEffect(() => {
    console.log(
      'CourseEditor - isEditing:',
      isEditing,
      'id:',
      id,
      'courseDetails:',
      courseDetails,
    )

    if (courseDetails) {
      const { course, lessons } = courseDetails

      // Handle cover image preview
      if (course.cover_image) {
        const imageUrl = getImageUrl(course.cover_image)
        console.log('Setting preview image URL:', imageUrl)
        setCoverImagePreview(imageUrl)
      }

      const c: any = course
      setCourseData({
        title_en: c.title_en ?? c.title ?? '',
        title_ar: c.title_ar ?? '',
        title_fr: c.title_fr ?? '',
        description_en: c.description_en ?? c.description ?? '',
        description_ar: c.description_ar ?? '',
        description_fr: c.description_fr ?? '',
        category: c.category || '',
        minAge: c.min_age ?? 3,
        maxAge: c.max_age ?? 12,
        isFree: c.is_free ?? true,
        isFeatured: c.is_published ?? false,
        coverImagePath: c.cover_image || null,
        learningObjectives: c.learning_objectives || c.learning_objectives_en || [],
        learningObjectivesAr: c.learning_objectives_ar || [],
        learningObjectivesFr: c.learning_objectives_fr || [],
        instructorNameEn: c.instructor_name_en || c.instructor_name || '',
        instructorNameAr: c.instructor_name_ar || '',
        instructorNameFr: c.instructor_name_fr || '',
        instructorBioEn: c.instructor_bio_en || c.instructor_bio || '',
        instructorBioAr: c.instructor_bio_ar || '',
        instructorBioFr: c.instructor_bio_fr || '',
        instructorAvatar: c.instructor_avatar || '',
        instructorUserId: c.instructor_user_id || null,
        instructorType: c.instructor_user_id ? 'user' : 'custom',
      })
      
      // Handle instructor avatar preview
      if (c.instructor_avatar) {
        const avatarUrl = getImageUrl(c.instructor_avatar)
        setInstructorAvatarPreview(avatarUrl)
      }

      // Process lessons for the form
      if (lessons && lessons.length > 0) {
        console.log('Processing lessons:', lessons)
        const lessonsForForm: CourseLessonForm[] = lessons.map(lesson => {
          console.log('Processing lesson:', lesson)

          return {
            id: lesson.id,
            title_en: lesson.title_en || lesson.title || '',
            title_ar: lesson.title_ar || '',
            title_fr: lesson.title_fr || '',
            description_en: lesson.description_en || lesson.description || '',
            description_ar: lesson.description_ar || '',
            description_fr: lesson.description_fr || '',
            videoPath: lesson.video_path || '',
            thumbnailPath: lesson.thumbnail_path || '',
            duration: lesson.duration || 0,
            isFree: course.is_free,
            order: lesson.lesson_order || 1,
            createdAt: lesson.created_at,
            thumbnailPreview: lesson.thumbnail_path
              ? getImageUrl(lesson.thumbnail_path)
              : null,
            videoUrl: lesson.video_url || '',
            uploadMethod: lesson.video_url ? 'url' : 'upload',
          }
        })

        console.log('Setting lessons for form:', lessonsForForm)
        setCourseLessons(lessonsForForm)
      } else {
        console.log('No lessons found, initializing empty lessons')
        setCourseLessons([])
      }
    }
  }, [courseDetails, isEditing, id])

  // Handle file input change for cover image
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log('New image file selected:', file.name, file.size)
      setCoverImageFile(file)

      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      console.log('Created preview URL:', objectUrl)
      setCoverImagePreview(objectUrl)
    }
  }

  // Handle file input change for instructor avatar
  const handleInstructorAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setInstructorAvatarFile(file)
      const objectUrl = URL.createObjectURL(file)
      setInstructorAvatarPreview(objectUrl)
    }
  }

  // Lesson management functions
  const addNewLesson = () => {
    const newLesson: CourseLessonForm = {
      title_en: '',
      title_ar: '',
      title_fr: '',
      description_en: '',
      description_ar: '',
      description_fr: '',
      videoPath: '',
      thumbnailPath: '',
      duration: 0,
      isFree: courseData.isFree,
      order: courseLessons.length + 1,
      createdAt: new Date().toISOString(),
      thumbnailPreview: null,
      videoUrl: '',
      uploadMethod: 'url',
    }

    setCourseLessons([...courseLessons, newLesson])
  }

  const deleteLesson = (index: number) => {
    const updatedLessons = courseLessons.filter((_, i) => i !== index)
    // Reorder lessons
    const reorderedLessons = updatedLessons.map((lesson, idx) => ({
      ...lesson,
      order: idx + 1,
    }))
    setCourseLessons(reorderedLessons)
  }

  const updateLessonField = (
    lessonIndex: number,
    field: keyof CourseLessonForm,
    value: any,
  ) => {
    const updatedLessons = [...courseLessons]
    ;(updatedLessons[lessonIndex] as any)[field] = value
    setCourseLessons(updatedLessons)
  }

  const handleLessonThumbnailChange = (
    lessonIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const updatedLessons = [...courseLessons]
      updatedLessons[lessonIndex].thumbnailFile = file
      updatedLessons[lessonIndex].thumbnailPreview = URL.createObjectURL(file)
      setCourseLessons(updatedLessons)
    }
  }

  const handleLessonVideoChange = (lessonIndex: number, url: string) => {
    const updatedLessons = [...courseLessons]
    updatedLessons[lessonIndex].videoUrl = url
    setCourseLessons(updatedLessons)
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(Math.floor(video.duration))
      }
      
      video.onerror = () => {
        reject(new Error('Failed to load video'))
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleLessonVideoFilesChange = async (
    lessonIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const updatedLessons = [...courseLessons]
      updatedLessons[lessonIndex].videoFiles = files
      
      // Try to calculate duration from video file
      const videoFile = files.find(f => f.type.startsWith('video/'))
      if (videoFile) {
        try {
          const duration = await getVideoDuration(videoFile)
          updatedLessons[lessonIndex].duration = duration
        } catch (error) {
          console.error('Error getting video duration:', error)
        }
      }
      
      setCourseLessons(updatedLessons)
    }
  }

  // Calculate total course duration from all lessons
  const calculateTotalDuration = () => {
    return courseLessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)
  }

  // Handle save/submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let coverImageUrl = courseData.coverImagePath

      // Upload cover image if changed
      if (coverImageFile) {
        console.log(
          'Uploading image file:',
          coverImageFile.name,
          'Size:',
          coverImageFile.size,
        )
        const filename = `course-cover-${Date.now()}-${coverImageFile.name}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('admin-content')
          .upload(`course-covers/${filename}`, coverImageFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        console.log('Upload successful:', uploadData)
        coverImageUrl = filename
        console.log('Storing filename in DB:', coverImageUrl)
      }
      
      // Upload instructor avatar if a new file was selected
      let instructorAvatarUrl = courseData.instructorAvatar
      if (instructorAvatarFile) {
        const filename = `instructor-avatar-${Date.now()}-${instructorAvatarFile.name}`

        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from('admin-content')
            .upload(`instructor-avatars/${filename}`, instructorAvatarFile, {
              cacheControl: '3600',
              upsert: false,
            })

        if (uploadError) throw uploadError
        instructorAvatarUrl = filename
      }

      // Calculate total course duration
      const totalDuration = calculateTotalDuration()

      // Create or update the course
      let courseId = id
      if (!isEditing) {
        const { data: newCourse, error: courseError } = await supabase
          .from('courses')
          .insert({
            title_en: courseData.title_en,
            title_ar: courseData.title_ar,
            title_fr: courseData.title_fr,
            description_en: courseData.description_en,
            description_ar: courseData.description_ar,
            description_fr: courseData.description_fr,
            category: courseData.category,
            cover_image: coverImageUrl,
            min_age: courseData.minAge,
            max_age: courseData.maxAge,
            is_free: courseData.isFree,
            is_published: courseData.isFeatured,
            lessons: courseLessons.length,
            duration: totalDuration,
            learning_objectives: courseData.learningObjectives,
            learning_objectives_en: courseData.learningObjectives,
            learning_objectives_ar: courseData.learningObjectivesAr,
            learning_objectives_fr: courseData.learningObjectivesFr,
            instructor_name_en: courseData.instructorNameEn || null,
            instructor_name_ar: courseData.instructorNameAr || null,
            instructor_name_fr: courseData.instructorNameFr || null,
            instructor_bio_en: courseData.instructorBioEn || null,
            instructor_bio_ar: courseData.instructorBioAr || null,
            instructor_bio_fr: courseData.instructorBioFr || null,
            instructor_avatar: instructorAvatarUrl || null,
            instructor_user_id: courseData.instructorType === 'user' ? courseData.instructorUserId : null,
          } as any)
          .select('id')
          .single()

        if (courseError) throw courseError
        courseId = newCourse.id
      } else {
        const { error: courseError } = await supabase
          .from('courses')
          .update({
            title_en: courseData.title_en,
            title_ar: courseData.title_ar,
            title_fr: courseData.title_fr,
            description_en: courseData.description_en,
            description_ar: courseData.description_ar,
            description_fr: courseData.description_fr,
            category: courseData.category,
            cover_image: coverImageUrl,
            min_age: courseData.minAge,
            max_age: courseData.maxAge,
            is_free: courseData.isFree,
            is_published: courseData.isFeatured,
            lessons: courseLessons.length,
            duration: totalDuration,
            learning_objectives: courseData.learningObjectives,
            learning_objectives_en: courseData.learningObjectives,
            learning_objectives_ar: courseData.learningObjectivesAr,
            learning_objectives_fr: courseData.learningObjectivesFr,
            instructor_name_en: courseData.instructorNameEn || null,
            instructor_name_ar: courseData.instructorNameAr || null,
            instructor_name_fr: courseData.instructorNameFr || null,
            instructor_bio_en: courseData.instructorBioEn || null,
            instructor_bio_ar: courseData.instructorBioAr || null,
            instructor_bio_fr: courseData.instructorBioFr || null,
            instructor_avatar: instructorAvatarUrl || null,
            instructor_user_id: courseData.instructorType === 'user' ? courseData.instructorUserId : null,
          } as any)
          .eq('id', courseId)

        if (courseError) throw courseError
      }

      // Handle course lessons
      if (isEditing) {
        // Delete existing lessons for this course
        const { error: deleteLessonsError } = await supabase
          .from('course_lessons')
          .delete()
          .eq('course_id', courseId)

        if (deleteLessonsError) throw deleteLessonsError
      }

      // Insert all lessons
      for (const lesson of courseLessons) {
        // Upload lesson thumbnail if it's a file
        let lessonThumbnailUrl = lesson.thumbnailPath
        if (lesson.thumbnailFile) {
          const filename = `lesson-thumb-${courseId}-${lesson.order}-${Date.now()}-${lesson.thumbnailFile.name}`

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from('admin-content')
              .upload(`course-thumbnails/${filename}`, lesson.thumbnailFile, {
                cacheControl: '3600',
                upsert: false,
              })

          if (uploadError) throw uploadError
          lessonThumbnailUrl = filename
        }

        // Handle video upload or URL
        let lessonVideoUrl = lesson.videoUrl || ''
        let lessonVideoPath = lesson.videoPath || ''

        // Upload HSL video files if provided
        if (lesson.videoFiles && lesson.videoFiles.length > 0) {
          const folder = `${courseId}/lesson-${lesson.order}-${Date.now()}`

          // Upload all video files to storage
          for (const file of lesson.videoFiles) {
            const { error: uploadError } = await supabase.storage
              .from('course-videos')
              .upload(`${folder}/${file.name}`, file, {
                cacheControl: '3600',
                upsert: false,
              })

            if (uploadError) {
              console.error('Video upload error:', uploadError)
              throw uploadError
            }
          }

          // Find the master playlist file (.m3u8) and store its storage path
          const m3u8File = lesson.videoFiles.find(f => f.name.endsWith('.m3u8'))
          if (m3u8File) {
            lessonVideoPath = `${folder}/${m3u8File.name}`
            lessonVideoUrl = '' // Clear URL since we're using storage path
          } else {
            throw new Error(
              'No .m3u8 playlist file found in the uploaded video files',
            )
          }
        }

        // Insert lesson
        const { error: lessonError } = await supabase
          .from('course_lessons')
          .insert({
            course_id: courseId,
            title: lesson.title_en,
            title_en: lesson.title_en,
            title_ar: lesson.title_ar,
            title_fr: lesson.title_fr,
            description: lesson.description_en,
            description_en: lesson.description_en,
            description_ar: lesson.description_ar,
            description_fr: lesson.description_fr,
            video_url: lessonVideoUrl,
            video_path: lessonVideoPath,
            thumbnail_path: lessonThumbnailUrl,
            duration: lesson.duration,
            lesson_order: lesson.order,
          })

        if (lessonError) throw lessonError
      }

      toast.success(`Course ${isEditing ? 'updated' : 'created'} successfully!`)
      navigate('/admin/courses')
    } catch (error: any) {
      console.error('Error saving course:', error)
      toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} course: ${error.message}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/courses')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>
      </header>

      {isEditing && isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-lg">Loading course details...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-8 grid gap-6">
            {/* Course Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  Basic information about the course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('admin:course_editor.title_label')}</Label>
                  <div className="flex flex-wrap gap-4 md:flex-nowrap">
                    <Input
                      id="title"
                      placeholder={t('admin:course_editor.title_placeholder.en')}
                      value={courseData.title_en}
                      onChange={e =>
                        setCourseData({
                          ...courseData,
                          title_en: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      id="title"
                      placeholder={t('admin:course_editor.title_placeholder.ar')}
                      value={courseData.title_ar}
                      onChange={e =>
                        setCourseData({
                          ...courseData,
                          title_ar: e.target.value,
                        })
                      }
                    />
                    <Input
                      id="title"
                      placeholder={t('admin:course_editor.title_placeholder.fr')}
                      value={courseData.title_fr}
                      onChange={e =>
                        setCourseData({
                          ...courseData,
                          title_fr: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('admin:course_editor.description_label')}</Label>
                  <div className="flex flex-wrap gap-4 md:flex-nowrap">
                    <Textarea
                      id="description"
                      placeholder="Enter course description in English"
                      value={courseData.description_en}
                      onChange={e =>
                        setCourseData({
                          ...courseData,
                          description_en: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
                      required
                    />
                    <Textarea
                      id="description"
                      placeholder="Enter course description in Arabic"
                      value={courseData.description_ar}
                      onChange={e =>
                        setCourseData({
                          ...courseData,
                          description_ar: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
                    />
                    <Textarea
                      id="description"
                      placeholder="Enter course description in French"
                      value={courseData.description_fr}
                      onChange={e =>
                        setCourseData({
                          ...courseData,
                          description_fr: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={courseData.category}
                      onValueChange={value =>
                        setCourseData({ ...courseData, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categoriesLoading ? (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              Loading categories...
                            </div>
                          ) : categories && categories.length > 0 ? (
                            categories.map(category => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              No categories available
                            </div>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cover-image">Cover Image</Label>
                    <div className="flex flex-col items-center gap-4">
                      {coverImagePreview ? (
                        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md border">
                          <img
                            src={getImageUrl(coverImagePreview)}
                            alt="Cover preview"
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => {
                              console.log('Clearing image preview')
                              setCoverImagePreview(null)
                              setCoverImageFile(null)
                              setCourseData({
                                ...courseData,
                                coverImagePath: null,
                              })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex aspect-square w-full max-w-[200px] flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 bg-muted">
                          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-center text-sm text-muted-foreground">
                            Click to upload or
                            <br />
                            drag and drop
                          </p>
                        </div>
                      )}
                      <Input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className={coverImagePreview ? 'hidden' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="min-age">Min Age</Label>
                        <Input
                          id="min-age"
                          type="number"
                          min="1"
                          max="18"
                          value={courseData.minAge}
                          onChange={e =>
                            setCourseData({
                              ...courseData,
                              minAge: parseInt(e.target.value) || 1,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-age">Max Age</Label>
                        <Input
                          id="max-age"
                          type="number"
                          min="1"
                          max="18"
                          value={courseData.maxAge}
                          onChange={e =>
                            setCourseData({
                              ...courseData,
                              maxAge: parseInt(e.target.value) || 18,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-free">Free Course</Label>
                      <Switch
                        id="is-free"
                        checked={courseData.isFree}
                        onCheckedChange={checked =>
                          setCourseData({ ...courseData, isFree: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-featured">Published</Label>
                      <Switch
                        id="is-featured"
                        checked={courseData.isFeatured}
                        onCheckedChange={checked =>
                          setCourseData({ ...courseData, isFeatured: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Objectives Card */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
                <CardDescription>
                  What will students learn from this course?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="en" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="ar">Arabic</TabsTrigger>
                    <TabsTrigger value="fr">French</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="en" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a learning objective (English)..."
                        value={newObjective}
                        onChange={e => setNewObjective(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newObjective.trim()) {
                              setCourseData({
                                ...courseData,
                                learningObjectives: [
                                  ...courseData.learningObjectives,
                                  newObjective.trim(),
                                ],
                              })
                              setNewObjective('')
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newObjective.trim()) {
                            setCourseData({
                              ...courseData,
                              learningObjectives: [
                                ...courseData.learningObjectives,
                                newObjective.trim(),
                              ],
                            })
                            setNewObjective('')
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {courseData.learningObjectives.length > 0 && (
                      <div className="space-y-2">
                        {courseData.learningObjectives.map((objective, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border p-2"
                          >
                            <span className="text-sm">{objective}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCourseData({
                                  ...courseData,
                                  learningObjectives:
                                    courseData.learningObjectives.filter(
                                      (_, i) => i !== index,
                                    ),
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ar" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a learning objective (Arabic)..."
                        value={newObjectiveAr}
                        onChange={e => setNewObjectiveAr(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newObjectiveAr.trim()) {
                              setCourseData({
                                ...courseData,
                                learningObjectivesAr: [
                                  ...courseData.learningObjectivesAr,
                                  newObjectiveAr.trim(),
                                ],
                              })
                              setNewObjectiveAr('')
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newObjectiveAr.trim()) {
                            setCourseData({
                              ...courseData,
                              learningObjectivesAr: [
                                ...courseData.learningObjectivesAr,
                                newObjectiveAr.trim(),
                              ],
                            })
                            setNewObjectiveAr('')
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {courseData.learningObjectivesAr.length > 0 && (
                      <div className="space-y-2">
                        {courseData.learningObjectivesAr.map((objective, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border p-2"
                          >
                            <span className="text-sm">{objective}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCourseData({
                                  ...courseData,
                                  learningObjectivesAr:
                                    courseData.learningObjectivesAr.filter(
                                      (_, i) => i !== index,
                                    ),
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="fr" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a learning objective (French)..."
                        value={newObjectiveFr}
                        onChange={e => setNewObjectiveFr(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newObjectiveFr.trim()) {
                              setCourseData({
                                ...courseData,
                                learningObjectivesFr: [
                                  ...courseData.learningObjectivesFr,
                                  newObjectiveFr.trim(),
                                ],
                              })
                              setNewObjectiveFr('')
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newObjectiveFr.trim()) {
                            setCourseData({
                              ...courseData,
                              learningObjectivesFr: [
                                ...courseData.learningObjectivesFr,
                                newObjectiveFr.trim(),
                              ],
                            })
                            setNewObjectiveFr('')
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {courseData.learningObjectivesFr.length > 0 && (
                      <div className="space-y-2">
                        {courseData.learningObjectivesFr.map((objective, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border p-2"
                          >
                            <span className="text-sm">{objective}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCourseData({
                                  ...courseData,
                                  learningObjectivesFr:
                                    courseData.learningObjectivesFr.filter(
                                      (_, i) => i !== index,
                                    ),
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Instructor Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor Information</CardTitle>
                <CardDescription>
                  Information about the course instructor (at least one language required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Instructor Type</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={courseData.instructorType === 'custom' ? 'default' : 'outline'}
                      onClick={() => setCourseData({ ...courseData, instructorType: 'custom', instructorUserId: null })}
                    >
                      Custom Instructor
                    </Button>
                    <Button
                      type="button"
                      variant={courseData.instructorType === 'user' ? 'default' : 'outline'}
                      onClick={() => setCourseData({ ...courseData, instructorType: 'user' })}
                    >
                      Select User
                    </Button>
                  </div>
                </div>

                {courseData.instructorType === 'user' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instructor-user">Select User as Instructor</Label>
                      <Select
                        value={courseData.instructorUserId || undefined}
                        onValueChange={async (userId) => {
                          setCourseData({ ...courseData, instructorUserId: userId })
                          
                          // Fetch user profile to populate instructor fields
                          const { data: profile } = await supabase
                            .from('profiles')
                            .select('parent_name, child_name')
                            .eq('id', userId)
                            .single()
                          
                          if (profile) {
                            const displayName = profile.child_name || profile.parent_name
                            setCourseData(prev => ({
                              ...prev,
                              instructorUserId: userId,
                              instructorNameEn: displayName,
                              instructorNameAr: displayName,
                              instructorNameFr: displayName,
                              instructorBioEn: `Instructor at Dolphoon`,
                              instructorBioAr: `مدرب في دولفون`,
                              instructorBioFr: `Instructeur chez Dolphoon`,
                            }))
                            toast.success('User selected as instructor')
                          }
                        }}
                      >
                        <SelectTrigger id="instructor-user">
                          <SelectValue placeholder="Select a user..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Users</SelectLabel>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.child_name || user.parent_name} ({user.parent_name})
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {courseData.instructorUserId && (
                      <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm font-medium">Selected Instructor Details:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Name (EN): {courseData.instructorNameEn}</p>
                          <p>Name (AR): {courseData.instructorNameAr}</p>
                          <p>Name (FR): {courseData.instructorNameFr}</p>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          You can switch to "Custom Instructor" to manually edit these fields.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Tabs defaultValue="en" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="ar">Arabic</TabsTrigger>
                        <TabsTrigger value="fr">French</TabsTrigger>
                      </TabsList>

                      <TabsContent value="en" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="instructor-name-en">Instructor Name (English)</Label>
                          <Input
                            id="instructor-name-en"
                            placeholder="Enter instructor name in English"
                            value={courseData.instructorNameEn}
                            onChange={e =>
                              setCourseData({
                                ...courseData,
                                instructorNameEn: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instructor-bio-en">Instructor Bio (English)</Label>
                          <Textarea
                            id="instructor-bio-en"
                            placeholder="Enter instructor biography in English..."
                            value={courseData.instructorBioEn}
                            onChange={e =>
                              setCourseData({
                                ...courseData,
                                instructorBioEn: e.target.value,
                              })
                            }
                            rows={3}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="ar" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="instructor-name-ar">Instructor Name (Arabic)</Label>
                          <Input
                            id="instructor-name-ar"
                            placeholder="أدخل اسم المدرب بالعربية"
                            value={courseData.instructorNameAr}
                            onChange={e =>
                              setCourseData({
                                ...courseData,
                                instructorNameAr: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instructor-bio-ar">Instructor Bio (Arabic)</Label>
                          <Textarea
                            id="instructor-bio-ar"
                            placeholder="أدخل السيرة الذاتية للمدرب بالعربية..."
                            value={courseData.instructorBioAr}
                            onChange={e =>
                              setCourseData({
                                ...courseData,
                                instructorBioAr: e.target.value,
                              })
                            }
                            rows={3}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="fr" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="instructor-name-fr">Instructor Name (French)</Label>
                          <Input
                            id="instructor-name-fr"
                            placeholder="Entrez le nom de l'instructeur en français"
                            value={courseData.instructorNameFr}
                            onChange={e =>
                              setCourseData({
                                ...courseData,
                                instructorNameFr: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instructor-bio-fr">Instructor Bio (French)</Label>
                          <Textarea
                            id="instructor-bio-fr"
                            placeholder="Entrez la biographie de l'instructeur en français..."
                            value={courseData.instructorBioFr}
                            onChange={e =>
                              setCourseData({
                                ...courseData,
                                instructorBioFr: e.target.value,
                              })
                            }
                            rows={3}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-2">
                      <Label htmlFor="instructor-avatar">Instructor Avatar</Label>
                      <div className="flex items-center gap-4">
                        {instructorAvatarPreview ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-full border">
                            <img
                              src={instructorAvatarPreview}
                              alt="Avatar preview"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute right-0 top-0 h-6 w-6"
                              onClick={() => {
                                setInstructorAvatarFile(null)
                                setInstructorAvatarPreview(null)
                                setCourseData({ ...courseData, instructorAvatar: '' })
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 bg-muted">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <Input
                          id="instructor-avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleInstructorAvatarChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Course Lessons Card */}
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>
                  Create lessons with videos and descriptions
                </CardDescription>
                <Button type="button" onClick={addNewLesson} className="mt-2">
                  <Plus className="mr-1 h-4 w-4" /> Add Lesson
                </Button>
              </CardHeader>
              <CardContent>
                {courseLessons.length === 0 ? (
                  <div className="rounded-md border py-8 text-center">
                    <p className="text-muted-foreground">
                      No lessons added yet. Click "Add Lesson" to get started.
                    </p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-4">
                    {courseLessons.map((lesson, lessonIndex) => (
                      <AccordionItem
                        key={lessonIndex}
                        value={`lesson-${lessonIndex}`}
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="mr-4 flex w-full items-center justify-between">
                            <span className="font-medium">
                              Lesson {lesson.order}:{' '}
                              {lesson.title_en || 'Untitled'}
                            </span>
                            <span
                              role="button"
                              className="rounded-xl border bg-red-500 p-2"
                              onClick={e => {
                                e.stopPropagation()
                                deleteLesson(lessonIndex)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Lesson Title</Label>
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Lesson title (English)"
                                    value={lesson.title_en}
                                    onChange={e =>
                                      updateLessonField(
                                        lessonIndex,
                                        'title_en',
                                        e.target.value,
                                      )
                                    }
                                    required
                                  />
                                  <Input
                                    placeholder="Lesson title (Arabic)"
                                    value={lesson.title_ar}
                                    onChange={e =>
                                      updateLessonField(
                                        lessonIndex,
                                        'title_ar',
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Lesson title (French)"
                                    value={lesson.title_fr}
                                    onChange={e =>
                                      updateLessonField(
                                        lessonIndex,
                                        'title_fr',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Video Duration</Label>
                                <div className="rounded-md border bg-muted px-3 py-2">
                                  <p className="text-sm">
                                    {lesson.duration > 0 
                                      ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}` 
                                      : 'Upload video to calculate'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Duration will be auto-calculated from video
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>{t('course_editor.lesson_description_label')}</Label>
                              <div className="space-y-2">
                                <Textarea
                                  placeholder={t('course_editor.lesson_description_placeholder.en')}
                                  value={lesson.description_en}
                                  onChange={e =>
                                    updateLessonField(
                                      lessonIndex,
                                      'description_en',
                                      e.target.value,
                                    )
                                  }
                                  className="min-h-[80px]"
                                />
                                <Textarea
                                  placeholder={t('course_editor.lesson_description_placeholder.ar')}
                                  value={lesson.description_ar}
                                  onChange={e =>
                                    updateLessonField(
                                      lessonIndex,
                                      'description_ar',
                                      e.target.value,
                                    )
                                  }
                                  className="min-h-[80px]"
                                />
                                <Textarea
                                  placeholder="Lesson description (French)"
                                  value={lesson.description_fr}
                                  onChange={e =>
                                    updateLessonField(
                                      lessonIndex,
                                      'description_fr',
                                      e.target.value,
                                    )
                                  }
                                  className="min-h-[80px]"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              {/* Lesson Thumbnail */}
                              <div className="space-y-2">
                                <Label>Lesson Thumbnail</Label>
                                <div className="flex items-center gap-4">
                                  {lesson.thumbnailPreview ? (
                                    <div className="relative h-20 w-32 overflow-hidden rounded-md border">
                                      <img
                                        src={lesson.thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="h-full w-full object-cover"
                                      />
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="absolute right-1 top-1 h-6 w-6"
                                        onClick={() => {
                                          const updatedLessons = [
                                            ...courseLessons,
                                          ]
                                          updatedLessons[
                                            lessonIndex
                                          ].thumbnailFile = null
                                          updatedLessons[
                                            lessonIndex
                                          ].thumbnailPreview = null
                                          setCourseLessons(updatedLessons)
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex h-20 w-32 flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 bg-muted">
                                      <Image className="mb-1 h-6 w-6 text-muted-foreground" />
                                      <p className="text-center text-xs text-muted-foreground">
                                        Upload
                                      </p>
                                    </div>
                                  )}
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e =>
                                      handleLessonThumbnailChange(
                                        lessonIndex,
                                        e,
                                      )
                                    }
                                    className="flex-1"
                                  />
                                </div>
                              </div>

                              {/* Video Upload Method Selection */}
                              <div className="space-y-2">
                                <Label>Video Method</Label>
                                <div className="flex gap-4">
                                  <label className="flex cursor-pointer items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`uploadMethod-${lessonIndex}`}
                                      value="url"
                                      checked={lesson.uploadMethod === 'url'}
                                      onChange={() => {
                                        const updatedLessons = [
                                          ...courseLessons,
                                        ]
                                        updatedLessons[
                                          lessonIndex
                                        ].uploadMethod = 'url'
                                        updatedLessons[lessonIndex].videoFiles =
                                          null
                                        setCourseLessons(updatedLessons)
                                      }}
                                      className="form-radio"
                                    />
                                    <span className="text-sm">HSL URL</span>
                                  </label>
                                  <label className="flex cursor-pointer items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`uploadMethod-${lessonIndex}`}
                                      value="upload"
                                      checked={lesson.uploadMethod === 'upload'}
                                      onChange={() => {
                                        const updatedLessons = [
                                          ...courseLessons,
                                        ]
                                        updatedLessons[
                                          lessonIndex
                                        ].uploadMethod = 'upload'
                                        updatedLessons[lessonIndex].videoUrl =
                                          ''
                                        setCourseLessons(updatedLessons)
                                      }}
                                      className="form-radio"
                                    />
                                    <span className="text-sm">
                                      Upload Files
                                    </span>
                                  </label>
                                </div>
                              </div>

                              {/* Video Input based on method */}
                              {lesson.uploadMethod === 'url' ? (
                                <div className="space-y-2">
                                  <Label>HSL Video URL</Label>
                                  <Input
                                    type="url"
                                    placeholder="Enter HSL video URL (e.g., https://example.com/video.m3u8)"
                                    value={lesson.videoUrl || ''}
                                    onChange={e =>
                                      handleLessonVideoChange(
                                        lessonIndex,
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter the URL for your HSL video stream
                                    (.m3u8 file)
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label>Upload HSL Video Files</Label>
                                  <div className="flex items-center gap-4">
                                    {lesson.videoFiles?.length ? (
                                      <div className="relative flex h-20 w-32 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                                        {lesson.videoFiles.length} files
                                        selected
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="destructive"
                                          className="absolute right-1 top-1 h-6 w-6"
                                          onClick={() => {
                                            const updatedLessons = [
                                              ...courseLessons,
                                            ]
                                            updatedLessons[
                                              lessonIndex
                                            ].videoFiles = null
                                            setCourseLessons(updatedLessons)
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex h-20 w-32 flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 bg-muted">
                                        <Video className="mb-1 h-6 w-6 text-muted-foreground" />
                                        <p className="text-center text-xs text-muted-foreground">
                                          Select Files
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <Input
                                        type="file"
                                        multiple
                                        accept=".m3u8,.ts,.mp4"
                                        onChange={e =>
                                          handleLessonVideoFilesChange(
                                            lessonIndex,
                                            e,
                                          )
                                        }
                                        className="mb-2"
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        Select all HSL files: .m3u8 playlist and
                                        .ts segments. You can also upload .mp4
                                        files.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/courses')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !courseData.title_en}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default CourseEditor
