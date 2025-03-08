
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
  fileName?: string;
}

const FileEditDialog: React.FC<FileEditDialogProps> = ({
  isOpen,
  onOpenChange,
  fileContent,
  setFileContent,
  onSave,
  fileName = "File"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit {fileName}</DialogTitle>
          <DialogDescription>
            Make changes to the file content before saving. AI has suggested edits that you can review.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-hidden">
          <div className="grid grid-cols-1 items-center gap-4">
            <div className="col-span-1 h-[50vh] overflow-auto">
              <Textarea
                id="content"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="font-mono h-full min-h-[300px] w-full resize-none"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileEditDialog;
