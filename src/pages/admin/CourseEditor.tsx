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
    instructorName: '',
    instructorBio: '',
    instructorAvatar: '',
    instructorExpertise: [] as string[],
  })

  const [newObjective, setNewObjective] = useState('')
  const [newExpertise, setNewExpertise] = useState('')

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

      setCourseData({
        title_en: course.title_en || '',
        title_ar: course.title_ar || '',
        title_fr: course.title_fr || '',
        description_en: course.description_en || '',
        description_ar: course.description_ar || '',
        description_fr: course.description_fr || '',
        category: course.category || '',
        minAge: course.min_age || 3,
        maxAge: course.max_age || 12,
        isFree: course.is_free || true,
        isFeatured: course.is_published || false,
        coverImagePath: course.cover_image,
        learningObjectives: course.learning_objectives || [],
        instructorName: course.instructor_name || '',
        instructorBio: course.instructor_bio || '',
        instructorAvatar: course.instructor_avatar || '',
        instructorExpertise: course.instructor_expertise || [],
      })

      // Process lessons for the form
      if (lessons && lessons.length > 0) {
        console.log('Processing lessons:', lessons)
        const lessonsForForm: CourseLessonForm[] = lessons.map(lesson => {
          console.log('Processing lesson:', lesson)

          return {
            id: lesson.id,
            title_en: lesson.title || '',
            title_ar: lesson.title || '',
            title_fr: lesson.title || '',
            description_en: lesson.description || '',
            description_ar: lesson.description || '',
            description_fr: lesson.description || '',
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

  const handleLessonVideoFilesChange = (
    lessonIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const updatedLessons = [...courseLessons]
      updatedLessons[lessonIndex].videoFiles = files
      setCourseLessons(updatedLessons)
    }
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
            learning_objectives: courseData.learningObjectives,
            instructor_name: courseData.instructorName || null,
            instructor_bio: courseData.instructorBio || null,
            instructor_avatar: courseData.instructorAvatar || null,
            instructor_expertise: courseData.instructorExpertise,
          })
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
            learning_objectives: courseData.learningObjectives,
            instructor_name: courseData.instructorName || null,
            instructor_bio: courseData.instructorBio || null,
            instructor_avatar: courseData.instructorAvatar || null,
            instructor_expertise: courseData.instructorExpertise,
          })
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
            description: lesson.description_en,
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
                  <Label htmlFor="title">Title</Label>
                  <div className="flex flex-wrap gap-4 md:flex-nowrap">
                    <Input
                      id="title"
                      placeholder="Enter course title in English"
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
                      placeholder="Enter course title in Arabic"
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
                      placeholder="Enter course title in French"
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
                  <Label htmlFor="description">Description</Label>
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
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a learning objective..."
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
              </CardContent>
            </Card>

            {/* Instructor Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor Information</CardTitle>
                <CardDescription>
                  Information about the course instructor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor-name">Instructor Name</Label>
                  <Input
                    id="instructor-name"
                    placeholder="Enter instructor name"
                    value={courseData.instructorName}
                    onChange={e =>
                      setCourseData({
                        ...courseData,
                        instructorName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor-bio">Instructor Bio</Label>
                  <Textarea
                    id="instructor-bio"
                    placeholder="Enter instructor biography..."
                    value={courseData.instructorBio}
                    onChange={e =>
                      setCourseData({
                        ...courseData,
                        instructorBio: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor-avatar">
                    Instructor Avatar URL
                  </Label>
                  <Input
                    id="instructor-avatar"
                    placeholder="Enter avatar image URL"
                    value={courseData.instructorAvatar}
                    onChange={e =>
                      setCourseData({
                        ...courseData,
                        instructorAvatar: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expertise Areas</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add expertise area..."
                      value={newExpertise}
                      onChange={e => setNewExpertise(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (newExpertise.trim()) {
                            setCourseData({
                              ...courseData,
                              instructorExpertise: [
                                ...courseData.instructorExpertise,
                                newExpertise.trim(),
                              ],
                            })
                            setNewExpertise('')
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newExpertise.trim()) {
                          setCourseData({
                            ...courseData,
                            instructorExpertise: [
                              ...courseData.instructorExpertise,
                              newExpertise.trim(),
                            ],
                          })
                          setNewExpertise('')
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {courseData.instructorExpertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {courseData.instructorExpertise.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => {
                              setCourseData({
                                ...courseData,
                                instructorExpertise:
                                  courseData.instructorExpertise.filter(
                                    (_, i) => i !== index,
                                  ),
                              })
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
                                <div className="flex flex-wrap gap-4 md:flex-nowrap">
                                  <Input
                                    placeholder="Enter lesson title"
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
                                    placeholder="Enter lesson title"
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
                                    placeholder="Enter lesson title"
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
                                <Label>Duration (minutes)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Duration in minutes"
                                  value={lesson.duration}
                                  onChange={e =>
                                    updateLessonField(
                                      lessonIndex,
                                      'duration',
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Lesson Description</Label>
                              <div className="flex flex-wrap gap-4 md:flex-nowrap">
                                <Textarea
                                  placeholder="Enter lesson description"
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
                                  placeholder="Enter lesson description"
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
                                  placeholder="Enter lesson description"
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
