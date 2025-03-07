
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FileEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileContent: string;
  setFileContent: (content: string) => void;
  onSave: () => void;
}

const FileEditDialog: React.FC<FileEditDialogProps> = ({
  isOpen,
  onOpenChange,
  fileContent,
  setFileContent,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit File Content</DialogTitle>
          <DialogDescription>
            Make changes to the file content before saving.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <div className="col-span-3">
              <Textarea
                id="content"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="font-mono h-[300px]"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileEditDialog;
