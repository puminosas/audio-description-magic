
import React, { useState, useEffect, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
}

const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ 
  children, 
  fallbackUI,
  errorMessage = "Failed to load data",
  onRetry 
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Reset error state when children change
  useEffect(() => {
    setHasError(false);
    setError(null);
  }, [children]);
  
  const handleError = (error: Error) => {
    console.error('API Error caught by boundary:', error);
    setError(error);
    setHasError(true);
  };
  
  const handleRetry = () => {
    setHasError(false);
    setError(null);
    if (onRetry) {
      onRetry();
    }
  };
  
  if (hasError) {
    return fallbackUI || (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error?.message || errorMessage}</p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              className="mt-2"
            >
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            onError: handleError
          });
        }
        return child;
      })}
    </React.Fragment>
  );
};

export default ApiErrorBoundary;
