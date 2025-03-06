
import React, { useState, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
  errorMessage?: string;
}

const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ 
  children, 
  fallbackUI,
  errorMessage = "Failed to load data" 
}) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return fallbackUI || (
      <Card className="w-full shadow-sm my-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg font-medium">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHasError(false)}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <React.Fragment>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            onError: () => setHasError(true)
          });
        }
        return child;
      })}
    </React.Fragment>
  );
};

export default ApiErrorBoundary;
