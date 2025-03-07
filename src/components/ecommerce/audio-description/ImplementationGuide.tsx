
import React from 'react';

const ImplementationGuide: React.FC = () => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Implementation Guide</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Step 1: Generate Audio Description</h3>
          <p>Use the form above to generate an audio description for your product.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Step 2: Choose Embedding Method</h3>
          <p>Select from basic HTML embedding, advanced player with custom controls, or API integration.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Step 3: Add to Your E-commerce Website</h3>
          <p>Copy the generated code and add it to your product page templates.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Step 4: Test & Optimize</h3>
          <ul className="list-disc pl-6">
            <li>Test on different browsers (Chrome, Firefox, Safari, Edge)</li>
            <li>Ensure mobile responsiveness for iOS and Android</li>
            <li>Check accessibility compliance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImplementationGuide;
