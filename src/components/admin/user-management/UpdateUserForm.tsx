
import React from 'react';
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface UpdateUserFormProps {
  email: string;
  selectedPlan: string;
  isAdmin: boolean;
  loading: boolean;
  setSelectedPlan: (value: string) => void;
  setIsAdmin: (value: boolean) => void;
  handleUpdateUser: () => Promise<void>;
}

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({ 
  email, 
  selectedPlan, 
  isAdmin, 
  loading, 
  setSelectedPlan, 
  setIsAdmin, 
  handleUpdateUser 
}) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">Update User Details</h3>
      
      <div className="space-y-2">
        <label htmlFor="userEmail" className="text-sm font-medium">Email</label>
        <Input id="userEmail" value={email} disabled />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="plan" className="text-sm font-medium">Plan</label>
        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isAdmin"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isAdmin" className="text-sm font-medium">Admin User</label>
      </div>
      
      <Button onClick={handleUpdateUser} disabled={loading} className="mt-4">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update User
      </Button>
    </div>
  );
};

export default UpdateUserForm;
