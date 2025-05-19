
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Bedtime Stories - Page Not Found";
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-transparent to-dream-light/10 px-4 py-12">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 bg-dream-light rounded-full mx-auto flex items-center justify-center mb-6">
          <span className="text-6xl">😴</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bubbly mb-4">Oops!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          It seems like this page has drifted off to dreamland. Let's get you back to your stories.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-dream-DEFAULT hover:bg-dream-dark">
              Return Home
            </Button>
          </Link>
          <Link to="/stories">
            <Button variant="outline">
              Browse Stories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
