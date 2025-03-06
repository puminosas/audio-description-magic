
import React from 'react';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  error?: Error | null;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
  const navigate = useNavigate();
  const routeError = useRouteError();
  
  let errorMessage = 'An unexpected error occurred';
  let statusCode: number | null = null;
  
  // Try to get meaningful error info
  if (isRouteErrorResponse(routeError)) {
    statusCode = routeError.status;
    errorMessage = routeError.statusText || routeError.data?.message || errorMessage;
  } else if (routeError instanceof Error) {
    errorMessage = routeError.message;
  } else if (error) {
    errorMessage = error.message;
  }
  
  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Application error:', routeError || error);
    // Use generic message in production
    if (!statusCode) {
      errorMessage = 'An unexpected error occurred';
    }
  }
  
  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-full flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Oops! Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            {statusCode ? `Error ${statusCode}: ${errorMessage}` : errorMessage}
          </p>
          <p className="text-muted-foreground text-sm">
            We apologize for the inconvenience. Our team has been notified and is working to fix this issue.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleReturnHome}>Return to Home</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;
