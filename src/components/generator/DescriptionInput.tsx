
import React from 'react';

interface DescriptionInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const DescriptionInput = ({ 
  value, 
  onChange,
  placeholder = "Enter text to convert to audio..."
}: DescriptionInputProps) => {
  return (
    <div className="md:col-span-2">
      <label htmlFor="description" className="block text-sm font-medium mb-1">
        Your Text
      </label>
      <textarea
        id="description"
        value={value}
        onChange={onChange}
        className="min-h-[100px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder={placeholder}
      />
    </div>
  );
};

export default DescriptionInput;
