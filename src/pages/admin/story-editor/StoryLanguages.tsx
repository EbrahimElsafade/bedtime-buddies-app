
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface StoryLanguagesProps {
  languages: string[];
  languageOptions: Array<{ value: string; label: string }>;
  onLanguageAdd: (language: string) => void;
  onLanguageRemove: (language: string) => void;
}

const StoryLanguages = ({
  languages,
  languageOptions,
  onLanguageAdd,
  onLanguageRemove,
}: StoryLanguagesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>
          Manage available languages for this story
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {languages.map(language => {
            const langOption = languageOptions.find(opt => opt.value === language);
            return (
              <Badge key={language} variant="outline" className="py-2 text-sm">
                {langOption?.label || language}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => onLanguageRemove(language)}
                  disabled={languages.length === 1}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <Select onValueChange={onLanguageAdd}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {languageOptions.map(language => (
                  <SelectItem
                    key={language.value}
                    value={language.value}
                    disabled={languages.includes(language.value)}
                  >
                    {language.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Language
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryLanguages;
