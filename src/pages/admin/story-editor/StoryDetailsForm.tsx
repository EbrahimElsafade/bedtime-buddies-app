
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { StoryData, categoryOptions } from "./types";

interface StoryDetailsFormProps {
  storyData: StoryData;
  setStoryData: (data: StoryData) => void;
  coverImagePreview: string | null;
  setCoverImagePreview: (url: string | null) => void;
  setCoverImageFile: (file: File | null) => void;
}

export const StoryDetailsForm = ({ 
  storyData, 
  setStoryData, 
  coverImagePreview, 
  setCoverImagePreview,
  setCoverImageFile 
}: StoryDetailsFormProps) => {
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('New image file selected:', file.name, file.size);
      setCoverImageFile(file);
      
      const objectUrl = URL.createObjectURL(file);
      console.log('Created preview URL:', objectUrl);
      setCoverImagePreview(objectUrl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Details</CardTitle>
        <CardDescription>
          Basic information about the story
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter story title"
              value={storyData.title}
              onChange={(e) => setStoryData({ ...storyData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={storyData.category}
              onValueChange={(value) => setStoryData({ ...storyData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categoryOptions.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter story description"
            value={storyData.description}
            onChange={(e) => setStoryData({ ...storyData, description: e.target.value })}
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image</Label>
            <div className="flex flex-col items-center gap-4">
              {coverImagePreview ? (
                <div className="relative w-full max-w-[200px] aspect-square rounded-md overflow-hidden border">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Preview image loaded successfully')}
                    onError={(e) => {
                      console.log('Preview image failed to load:', coverImagePreview);
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      console.log('Clearing image preview');
                      setCoverImagePreview(null);
                      setCoverImageFile(null);
                      setStoryData({ ...storyData, cover_image: null });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full max-w-[200px] aspect-square rounded-md bg-muted border border-dashed border-muted-foreground/50">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Click to upload or<br />drag and drop
                  </p>
                </div>
              )}
              <Input 
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className={coverImagePreview ? "hidden" : ""}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={storyData.duration}
                onChange={(e) => setStoryData({ ...storyData, duration: parseInt(e.target.value) || 5 })}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is-free">Free Story</Label>
              <Switch
                id="is-free"
                checked={storyData.is_free}
                onCheckedChange={(checked) => setStoryData({ ...storyData, is_free: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is-published">Published</Label>
              <Switch
                id="is-published"
                checked={storyData.is_published}
                onCheckedChange={(checked) => setStoryData({ ...storyData, is_published: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
