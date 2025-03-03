
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const AdminActionsPanel: React.FC = () => {
  return (
    <Card className="p-4">
      <h3 className="mb-3 flex items-center text-lg font-medium">
        <User className="mr-2 h-5 w-5" />
        Admin Actions
      </h3>
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <span className="truncate">View System Status</span>
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <span className="truncate">Manage User Permissions</span>
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <span className="truncate">Update App Settings</span>
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <span className="truncate">View Activity Logs</span>
        </Button>
      </div>
    </Card>
  );
};

export default AdminActionsPanel;
