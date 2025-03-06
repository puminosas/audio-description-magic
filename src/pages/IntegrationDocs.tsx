
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmbedCodeExamples from '@/components/embed/EmbedCodeExamples';
import IntegrationSteps from '@/components/embed/IntegrationSteps';
import AudioDemo from '@/components/embed/AudioDemo';

const IntegrationDocs = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Integrating AI-Generated Audio Descriptions</h1>
      <p className="text-lg mb-8">
        Enhance your e-commerce product pages with AI-generated audio descriptions. 
        This guide explains how to embed audio players that provide dynamic voice descriptions 
        of your products, improving accessibility and customer engagement.
      </p>

      <Tabs defaultValue="demo">
        <TabsList className="mb-8">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="code">Code Examples</TabsTrigger>
          <TabsTrigger value="steps">Integration Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="demo">
          <Card>
            <CardContent className="pt-6">
              <AudioDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardContent className="pt-6">
              <EmbedCodeExamples />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps">
          <Card>
            <CardContent className="pt-6">
              <IntegrationSteps />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationDocs;
