
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AutoplayToggleProps {
  isAutoplay: boolean;
  onAutoplayChange: (enabled: boolean) => void;
  currentSectionDir: "rtl" | "ltr";
}

export const AutoplayToggle = ({
  isAutoplay,
  onAutoplayChange,
  currentSectionDir,
}: AutoplayToggleProps) => {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse" dir={currentSectionDir}>
      <Switch
        id="autoplay"
        checked={isAutoplay}
        onCheckedChange={onAutoplayChange}
      />
      <Label htmlFor="autoplay" className="text-sm font-medium">
        Autoplay
      </Label>
    </div>
  );
};
