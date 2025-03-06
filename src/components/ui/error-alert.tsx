
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorAlertProps {
  title?: string;
  message: string | null;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  severity = 'error',
  onRetry,
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'error':
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (severity) {
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      case 'error':
      default:
        return 'destructive';
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (severity) {
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'error':
      default:
        return 'Error';
    }
  };

  return (
    <Alert variant={getVariant()} className={`mb-4 ${className}`}>
      {getIcon()}
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{message}</p>
        {(onRetry || onDismiss) && (
          <div className="flex gap-2 mt-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
