
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save } from 'lucide-react';
import GenerationLimitsCard from '@/components/admin/settings/GenerationLimitsCard';
import PricingSettingsCard from '@/components/admin/settings/PricingSettingsCard';
import SystemSettingsCard from '@/components/admin/settings/SystemSettingsCard';
import ChatGptSettingsCard from '@/components/admin/settings/ChatGptSettingsCard';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings = () => {
  const { settings, setSettings, loading, handleSaveSettings } = useAdminSettings();

  return (
    <div className="h-full w-full flex flex-col p-4 space-y-6 overflow-auto">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="chatgpt">ChatGPT Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <GenerationLimitsCard settings={settings} setSettings={setSettings} />
          <PricingSettingsCard settings={settings} setSettings={setSettings} />
          <SystemSettingsCard settings={settings} setSettings={setSettings} />
        </TabsContent>
        
        <TabsContent value="chatgpt" className="space-y-6">
          <ChatGptSettingsCard settings={settings} setSettings={setSettings} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
