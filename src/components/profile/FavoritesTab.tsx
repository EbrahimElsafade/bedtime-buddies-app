
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const FavoritesTab = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Favorite Stories</CardTitle>
        <CardDescription>
          Stories you've marked as favorites
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          You haven't added any stories to favorites yet.
        </p>
        <Button onClick={() => navigate("/stories")}>
          Browse Stories
        </Button>
      </CardContent>
    </Card>
  );
};
