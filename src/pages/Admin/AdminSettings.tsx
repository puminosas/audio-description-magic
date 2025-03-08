
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save } from 'lucide-react';
import GenerationLimitsCard from '@/components/admin/settings/GenerationLimitsCard';
import PricingSettingsCard from '@/components/admin/settings/PricingSettingsCard';
import SystemSettingsCard from '@/components/admin/settings/SystemSettingsCard';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const AdminSettings = () => {
  const { settings, setSettings, loading, handleSaveSettings } = useAdminSettings();

  return (
    <div className="h-full w-full flex flex-col p-4 space-y-6 overflow-auto">
      <GenerationLimitsCard settings={settings} setSettings={setSettings} />
      <PricingSettingsCard settings={settings} setSettings={setSettings} />
      <SystemSettingsCard settings={settings} setSettings={setSettings} />
      
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
