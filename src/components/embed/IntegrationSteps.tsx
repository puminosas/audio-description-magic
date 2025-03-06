
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Code, Globe, CheckCircle } from 'lucide-react';

const IntegrationSteps = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">Integration Guide</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
              <span>Shopify Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm">
              <li>Go to <strong>Online Store &gt; Themes &gt; Edit Code</strong></li>
              <li>Find the <strong>product.liquid</strong> template</li>
              <li>Insert the audio embed code inside the product description section</li>
              <li>If using dynamic loading, add the fetch script to your theme.js file</li>
              <li>Save changes and test on a product page</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5 text-primary" />
              <span>WooCommerce Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm">
              <li>Go to <strong>Product Editor &gt; Custom Fields</strong></li>
              <li>Add a new field for <strong>audio URL</strong></li>
              <li>Modify the <strong>single-product.php</strong> template to include the audio player</li>
              <li>Add the audio player code where you want it to appear in the template</li>
              <li>Save changes and update your product with an audio URL</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-primary" />
              <span>Custom Website Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm">
              <li>Copy the audio embed code from the examples above</li>
              <li>Paste the code into your product detail page template</li>
              <li>Replace the sample URL with your dynamic audio URL</li>
              <li>If using a JavaScript framework, adapt the code to suit your framework</li>
              <li>Implement the API call to fetch audio URLs for each product</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-primary" />
              <span>Testing &amp; Optimization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>Test playback on different browsers (Chrome, Firefox, Safari, Edge)</li>
              <li>Ensure mobile responsiveness for iOS and Android devices</li>
              <li>Check accessibility compliance (use aria-label for screen readers)</li>
              <li>Optimize loading time by setting preload="metadata" or preload="none"</li>
              <li>Consider adding captions or transcripts for better accessibility</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-muted/30 p-6 rounded-lg border border-muted">
        <h3 className="text-lg font-medium mb-4">API Documentation</h3>
        <p className="mb-4">
          Our API allows you to generate audio descriptions for any product in your catalog.
          You can access the API using the following endpoint:
        </p>
        <div className="bg-muted p-3 rounded-md text-sm font-mono">
          POST https://api.audiodescriptions.online/generate-audio
        </div>
        <h4 className="font-medium mt-4 mb-2">Request Parameters:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>product_name</strong> - The name of the product</li>
          <li><strong>description</strong> (optional) - Additional product details</li>
          <li><strong>language</strong> (optional) - Language code (default: en-US)</li>
          <li><strong>voice</strong> (optional) - Voice ID for text-to-speech</li>
        </ul>
      </div>
    </div>
  );
};

export default IntegrationSteps;
