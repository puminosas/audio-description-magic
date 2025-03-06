
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface DescriptionInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const DescriptionInput = ({ value, onChange }: DescriptionInputProps) => {
  return (
    <div className="md:col-span-2">
      <label htmlFor="description" className="block text-sm font-medium mb-2">
        Product Description
      </label>
      <Textarea
        id="description"
        placeholder="Enter your product description here..."
        value={value}
        onChange={onChange}
        className="h-32"
      />
    </div>
  );
};

export default DescriptionInput;
