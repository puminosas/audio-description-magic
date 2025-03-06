
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface DescriptionInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const DescriptionInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter product name or description" 
}: DescriptionInputProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Product Name or Description
      </label>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-32 resize-y"
        maxLength={2000}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {value.length < 20 
            ? "Short input will trigger an enhanced description"
            : "Longer descriptions will be used directly"}
        </span>
        <span>{value.length}/2000</span>
      </div>
    </div>
  );
};

export default DescriptionInput;
