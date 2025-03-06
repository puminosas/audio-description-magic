
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

export interface DescriptionInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter your product description here...",
  disabled = false
}) => {
  return (
    <div className="w-full">
      <label htmlFor="description" className="block text-sm font-medium mb-2">
        Product Description
      </label>
      <Textarea
        id="description"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[120px]"
      />
      <p className="text-xs text-muted-foreground mt-1">
        {value.length > 0 ? `${value.length} characters` : 'Enter a product name or description to generate audio'}
      </p>
    </div>
  );
};

export default DescriptionInput;
