
import React from 'react';
import { Check, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { LanguageOption } from '@/utils/audio/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LanguageListProps {
  loading: boolean;
  error: string | null;
  displayLanguages: LanguageOption[];
  selectedLanguage: LanguageOption | null;
  onSelect: (language: LanguageOption) => void;
  searchQuery: string;
}

const LanguageList = ({
  loading,
  error,
  displayLanguages,
  selectedLanguage,
  onSelect,
  searchQuery
}: LanguageListProps) => {
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (displayLanguages.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {searchQuery.trim() ? 'No matching languages found' : 'No languages available'}
      </div>
    );
  }

  return (
    <>
      {displayLanguages.map((language) => (
        <DropdownMenuItem
          key={language.code}
          className="cursor-pointer"
          onClick={() => onSelect(language)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <div>
                <div>{language.name}</div>
              </div>
            </div>
            {selectedLanguage && language.code === selectedLanguage.code && (
              <Check className="h-4 w-4" />
            )}
          </div>
        </DropdownMenuItem>
      ))}
    </>
  );
};

export default LanguageList;
