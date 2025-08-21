
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthCard = ({ title, description, children, footer }: AuthCardProps) => {
  return (
    <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <Card className="border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bubbly">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
          {footer && <CardFooter className="text-center">{footer}</CardFooter>}
        </Card>
      </div>
    </div>
  );
};
