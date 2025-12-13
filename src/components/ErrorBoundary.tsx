import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { logError } from '@/utils/errorHandling';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when an error occurs
 */
class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, 'ErrorBoundary');
    logError(errorInfo.componentStack, 'ErrorBoundary - Component Stack', 'info');
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
    
    // Reload the page to reset the app state
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>{this.props.t('error.somethingWentWrong', { ns: 'common' })}</CardTitle>
              </div>
              <CardDescription>
                {this.props.t('error.errorDescription', { ns: 'common' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {import.meta.env.DEV && this.state.error && (
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={this.handleReset} className="w-full">
                {this.props.t('error.returnToHome', { ns: 'common' })}
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation('common')(ErrorBoundaryBase);

/**
 * Hook-based error boundary wrapper for functional components
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};
