
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import GeneratorHeader from './GeneratorHeader';
import GeneratorTabs from './GeneratorTabs';
import GeneratorSidebar from './GeneratorSidebar';
import ErrorAlert from './ErrorAlert';
import { useGenerationLogic } from './hooks/useGenerationLogic';

const GeneratorContainer = () => {
  const { user, loading } = useAuth();
  const { error, googleTtsAvailable, suppressErrors } = useGenerationLogic();
  
  // Don't redirect authenticated users
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto p-4">
      <GeneratorHeader />
      
      {/* Only show error if it's not being suppressed */}
      {error && !suppressErrors && (
        <ErrorAlert 
          error={error} 
          isGoogleTtsError={!googleTtsAvailable}
          hideWhenGoogleTtsWorking={suppressErrors}
        />
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <GeneratorTabs />
        </div>
        <div className="lg:col-span-1">
          <GeneratorSidebar />
        </div>
      </div>
    </div>
  );
};

export default GeneratorContainer;
