import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Upload, X } from 'lucide-react'

interface StoryDetailsFormProps {
  storyData: {
    title: Record<string, string>
    description: Record<string, string>
    category: string
    cover_image: string | null
  }
  categories: any[] | undefined
  categoriesLoading: boolean
  coverImagePreview: string | null
  onTitleChange: (language: string, value: string) => void
  onDescriptionChange: (language: string, value: string) => void
  onCategoryChange: (value: string) => void
  onCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearCoverImage: () => void
}

export const StoryDetailsForm = ({
  storyData,
  categories,
  categoriesLoading,
  coverImagePreview,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onCoverImageChange,
  onClearCoverImage,
}: StoryDetailsFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Details</CardTitle>
        <CardDescription>
          Basic information about the story in multiple languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Multilingual Title and Description with Fixed Tabs */}
        <Tabs defaultValue="en" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="ar">Arabic</TabsTrigger>
            <TabsTrigger value="fr">French</TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title-en">Title (English)</Label>
              <Input
                id="title-en"
                placeholder="Enter story title in English"
                value={storyData.title.en || ''}
                onChange={e => onTitleChange('en', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description-en">Description (English)</Label>
              <Textarea
                id="description-en"
                placeholder="Enter story description in English"
                value={storyData.description.en || ''}
                onChange={e => onDescriptionChange('en', e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="ar" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title-ar">Title (Arabic)</Label>
              <Input
                id="title-ar"
                placeholder="Enter story title in Arabic"
                value={storyData.title.ar || ''}
                onChange={e => onTitleChange('ar', e.target.value)}
                dir="rtl"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description-ar">Description (Arabic)</Label>
              <Textarea
                id="description-ar"
                placeholder="Enter story description in Arabic"
                value={storyData.description.ar || ''}
                onChange={e => onDescriptionChange('ar', e.target.value)}
                className="min-h-[100px] text-right"
                dir="rtl"
              />
            </div>
          </TabsContent>

          <TabsContent value="fr" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title-fr">Title (French)</Label>
              <Input
                id="title-fr"
                placeholder="Enter story title in French"
                value={storyData.title.fr || ''}
                onChange={e => onTitleChange('fr', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description-fr">Description (French)</Label>
              <Textarea
                id="description-fr"
                placeholder="Enter story description in French"
                value={storyData.description.fr || ''}
                onChange={e => onDescriptionChange('fr', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={storyData.category} onValueChange={onCategoryChange}>
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
                      <SelectItem key={category.id} value={category.name}>
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

          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image</Label>
            <div className="flex flex-col items-center gap-4">
              {coverImagePreview ? (
                <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md border">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={onClearCoverImage}
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
                onChange={onCoverImageChange}
                className={coverImagePreview ? 'hidden' : ''}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}