
import { Button } from "@/components/ui/button";

interface OAuthButtonsProps {
  onGoogleClick: () => Promise<void>;
  onAppleClick: () => Promise<void>;
  isLoading: boolean;
}

export const OAuthButtons = ({ onGoogleClick, onAppleClick, isLoading }: OAuthButtonsProps) => {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-nightsky-light px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onGoogleClick}
          disabled={isLoading}
          aria-label="Sign in with Google"
        >
          Google
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={onAppleClick}
          disabled={isLoading}
          aria-label="Sign in with Apple"
        >
          Apple
        </Button>
      </div>
    </div>
  );
};
