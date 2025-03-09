
import React from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminDocumentation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Project Documentation</h2>
        <p className="text-muted-foreground">
          Comprehensive documentation for the Audio Descriptions platform
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="ui-design">UI Design</TabsTrigger>
          <TabsTrigger value="generation">Audio Generation</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>Audio Descriptions Platform</CardTitle>
            <CardDescription>
              Complete technical and user documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] w-full pr-4">
              <TabsContent value="overview" className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Project Overview</h3>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Introduction</h4>
                  <p>
                    Audio Descriptions Online is a platform designed to generate AI-powered audio descriptions
                    for products, images, and content. The platform utilizes advanced natural language
                    processing and text-to-speech technologies to create high-quality, natural-sounding
                    audio descriptions that enhance accessibility and user engagement across digital platforms.
                  </p>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Purpose and Objectives</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Improve accessibility for visually impaired users by providing rich audio descriptions</li>
                    <li>Enhance e-commerce product pages with audio content to increase engagement</li>
                    <li>Provide a simple API for developers to integrate audio descriptions into their applications</li>
                    <li>Create a platform that can scale to handle millions of audio generation requests</li>
                    <li>Support multiple languages and voices to serve a global audience</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Target Audience</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>E-commerce business owners and marketers</li>
                    <li>Web developers and UX designers</li>
                    <li>Accessibility specialists</li>
                    <li>Content creators and marketers</li>
                    <li>Companies seeking to improve their digital accessibility compliance</li>
                  </ul>
                </section>
              </TabsContent>
              
              <TabsContent value="requirements" className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Requirements Specification</h3>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Functional Requirements</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>User authentication and account management</li>
                    <li>Audio description generation from text input</li>
                    <li>Language and voice selection options</li>
                    <li>Audio file storage and management</li>
                    <li>API for integration with external systems</li>
                    <li>User dashboard with usage statistics</li>
                    <li>Admin controls for system management</li>
                    <li>Payment processing for premium features</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Non-Functional Requirements</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Performance: Audio generation completed within 10 seconds</li>
                    <li>Scalability: Ability to handle 10,000+ concurrent users</li>
                    <li>Reliability: 99.9% uptime SLA</li>
                    <li>Security: Encryption of user data and secure API access</li>
                    <li>Usability: Intuitive interface requiring minimal training</li>
                    <li>Compatibility: Support for all major browsers and mobile devices</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">User Stories</h4>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md">
                      <p className="font-medium">As an e-commerce store owner</p>
                      <p>I want to add audio descriptions to my product pages</p>
                      <p>So that I can improve accessibility and user engagement</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <p className="font-medium">As a developer</p>
                      <p>I want to access audio generation via an API</p>
                      <p>So that I can integrate it into my custom applications</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <p className="font-medium">As a content creator</p>
                      <p>I want to convert my written content into audio</p>
                      <p>So that I can reach audiences who prefer listening over reading</p>
                    </div>
                  </div>
                </section>
              </TabsContent>
              
              <TabsContent value="architecture" className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">3. System Architecture</h3>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Overview of System Components</h4>
                  <p>
                    The platform is built using a modern, cloud-based architecture designed for scalability
                    and reliability. The system consists of the following key components:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Frontend React application for user interface</li>
                    <li>Supabase backend for authentication, database, and storage</li>
                    <li>Supabase Edge Functions for serverless API endpoints</li>
                    <li>Google Cloud Text-to-Speech API for high-quality voice synthesis</li>
                    <li>OpenAI GPT API for enhanced text generation</li>
                    <li>Cloud storage for audio file persistence</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Technology Stack</h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="font-medium">Frontend:</p>
                      <ul className="list-disc pl-6">
                        <li>React + TypeScript</li>
                        <li>Tailwind CSS</li>
                        <li>Shadcn UI Components</li>
                        <li>Vite (build tool)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Backend:</p>
                      <ul className="list-disc pl-6">
                        <li>Supabase (PostgreSQL)</li>
                        <li>Supabase Auth</li>
                        <li>Supabase Storage</li>
                        <li>Edge Functions (Deno)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">AI/ML:</p>
                      <ul className="list-disc pl-6">
                        <li>Google Cloud TTS</li>
                        <li>OpenAI GPT</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">DevOps:</p>
                      <ul className="list-disc pl-6">
                        <li>GitHub Actions</li>
                        <li>Cloud Hosting</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </TabsContent>
              
              <TabsContent value="ui-design" className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">4. User Interface Design</h3>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">User Experience (UX) Considerations</h4>
                  <p>
                    The platform's interface is designed with the following UX principles:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Simplicity: Minimalist design with clear user flows</li>
                    <li>Efficiency: Optimized workflows to generate audio with minimal steps</li>
                    <li>Feedback: Real-time status updates during processing</li>
                    <li>Consistency: Uniform design language across all pages</li>
                    <li>Responsiveness: Full functionality across desktop and mobile devices</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Accessibility Features</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>High contrast mode for visually impaired users</li>
                    <li>Keyboard navigation support</li>
                    <li>Screen reader compatibility</li>
                    <li>Descriptive alt tags for all images</li>
                    <li>Focus indicators for interactive elements</li>
                    <li>ARIA labels and roles throughout the application</li>
                    <li>Compliance with WCAG 2.1 AA standards</li>
                  </ul>
                </section>
              </TabsContent>
              
              <TabsContent value="generation" className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Audio Description Generation Process</h3>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Description of the AI Model</h4>
                  <p>
                    The platform leverages two key AI technologies:
                  </p>
                  <ol className="list-decimal pl-6 space-y-3 mt-2">
                    <li>
                      <p className="font-medium">Natural Language Processing (GPT)</p>
                      <p>
                        We use OpenAI's GPT models to enhance basic product descriptions into rich, 
                        detailed narratives that are optimized for audio presentation. The model is 
                        fine-tuned to create descriptions that flow naturally when spoken and include
                        relevant details about product features, benefits, and use cases.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Text-to-Speech Synthesis</p>
                      <p>
                        Google Cloud Text-to-Speech API provides high-quality voice synthesis with
                        natural-sounding intonation and rhythm. The platform offers access to over
                        220 voices across 40+ languages, with multiple voice options per language
                        including different genders and speaking styles.
                      </p>
                    </li>
                  </ol>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Workflow of Audio Description Creation</h4>
                  <ol className="list-decimal pl-6 space-y-2 mt-2">
                    <li>User inputs product name and basic description</li>
                    <li>System enhances the description using GPT (for short inputs)</li>
                    <li>User selects preferred language and voice</li>
                    <li>Enhanced text is sent to Google TTS for audio generation</li>
                    <li>Generated audio is processed and stored in the cloud</li>
                    <li>Audio URL is returned to the user for playback or embedding</li>
                    <li>Usage metrics are updated in the user's account</li>
                  </ol>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Performance Considerations</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Audio generation typically completes in 3-10 seconds depending on text length</li>
                    <li>Maximum text length is limited to 5000 characters per generation</li>
                    <li>Audio files are optimized for size without sacrificing quality</li>
                    <li>Caching is implemented to avoid regenerating identical content</li>
                    <li>Rate limiting ensures system stability during high traffic</li>
                  </ul>
                </section>
              </TabsContent>
            </ScrollArea>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default AdminDocumentation;
