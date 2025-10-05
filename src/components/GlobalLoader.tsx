import { useLoading } from '@/contexts/LoadingContext';
import { Loader2 } from 'lucide-react';

export const GlobalLoader = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 shadow-lg">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        {loadingMessage && (
          <p className="text-center text-sm text-muted-foreground">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
};
