
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, X } from "lucide-react";

interface StoryBasicDetailsProps {
  storyData: {
    title: string;
    description: string;
    category: string;
    duration: number;
    is_free: boolean;
    is_published: boolean;
    cover_image: string | null;
  };
  coverImagePreview: string | null;
  categoryOptions: Array<{ value: string; label: string }>;
  onStoryDataChange: (data: any) => void;
  onCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverImageRemove: () => void;
}

const StoryBasicDetails = ({
  storyData,
  coverImagePreview,
  categoryOptions,
  onStoryDataChange,
  onCoverImageChange,
  onCoverImageRemove,
}: StoryBasicDetailsProps) => {
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
              onChange={(e) => onStoryDataChange({ title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={storyData.category}
              onValueChange={(value) => onStoryDataChange({ category: value })}
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
            onChange={(e) => onStoryDataChange({ description: e.target.value })}
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
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={onCoverImageRemove}
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
                onChange={onCoverImageChange}
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
                onChange={(e) => onStoryDataChange({ duration: parseInt(e.target.value) || 5 })}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is-free">Free Story</Label>
              <Switch
                id="is-free"
                checked={storyData.is_free}
                onCheckedChange={(checked) => onStoryDataChange({ is_free: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is-published">Published</Label>
              <Switch
                id="is-published"
                checked={storyData.is_published}
                onCheckedChange={(checked) => onStoryDataChange({ is_published: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryBasicDetails;
