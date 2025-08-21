
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface RegisterStepTwoProps {
  childName: string;
  setChildName: (name: string) => void;
  childAge: string;
  setChildAge: (age: string) => void;
  language: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr';
  setLanguage: (lang: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr') => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string;
}

export const RegisterStepTwo = ({
  childName,
  setChildName,
  childAge,
  setChildAge,
  language,
  setLanguage,
  onBack,
  onSubmit,
  isLoading,
  error
}: RegisterStepTwoProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="childName">Child's Name (Optional)</Label>
        <Input
          id="childName"
          value={childName}
          onChange={e => setChildName(e.target.value)}
          placeholder="Adam"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="childAge">Child's Age (Optional)</Label>
        <Input
          id="childAge"
          type="number"
          min="1"
          max="12"
          value={childAge}
          onChange={e => setChildAge(e.target.value)}
          placeholder="6"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Preferred Language</Label>
        <Select
          value={language}
          onValueChange={value =>
            setLanguage(value as 'en' | 'ar-eg' | 'ar-fos7a' | 'fr')
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ar-eg">مصري</SelectItem>
            <SelectItem value="ar-fos7a">فصحى</SelectItem>
            <SelectItem value="fr">français</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="button"
          className="bg-dream-DEFAULT flex-1 hover:bg-dream-dark"
          disabled={isLoading}
          onClick={onSubmit}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>
    </div>
  );
};
