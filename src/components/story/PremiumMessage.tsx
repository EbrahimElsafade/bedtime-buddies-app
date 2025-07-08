
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PremiumMessageProps {
  onSubscriptionClick: () => void;
  onLoginClick: () => void;
  isAuthenticated: boolean;
}

export const PremiumMessage = ({ onSubscriptionClick, onLoginClick, isAuthenticated }: PremiumMessageProps) => {
  return (
    <Card className="p-8 text-center border-moon-DEFAULT/30 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm">
      <h3 className="text-2xl font-bubbly mb-4 text-moon-dark">Premium Story</h3>
      <p className="mb-6 max-w-md mx-auto">
        This is a premium story. Subscribe to our premium plan to unlock this story and many more!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onSubscriptionClick} className="bg-moon-DEFAULT hover:bg-moon-dark">
          See Subscription Plans
        </Button>
        {!isAuthenticated && (
          <Button variant="outline" onClick={onLoginClick}>
            Log In
          </Button>
        )}
      </div>
    </Card>
  );
};
