
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/auth";

interface SubscriptionTabProps {
  profile: Profile;
}

export const SubscriptionTab = ({ profile }: SubscriptionTabProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subscription</CardTitle>
        <CardDescription>
          Manage your subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <div className="inline-block bg-secondary/50 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium">
              {profile.is_premium ? "Premium Plan" : "Free Plan"}
            </span>
          </div>
          
          {profile.is_premium ? (
            <p className="text-muted-foreground mb-6">
              You are currently on the Premium plan. Enjoy unlimited access to all stories and features.
            </p>
          ) : (
            <p className="text-muted-foreground mb-6">
              Upgrade to Premium for unlimited access to all stories and features.
            </p>
          )}
          
          {!profile.is_premium && (
            <Button 
              onClick={() => navigate("/subscription")} 
              className="bg-moon-DEFAULT hover:bg-moon-dark"
            >
              Upgrade to Premium
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
