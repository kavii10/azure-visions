import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiConfigDialog = ({ open, onOpenChange }: ApiConfigDialogProps) => {
  const [endpoint, setEndpoint] = useState(() => 
    localStorage.getItem('azure_endpoint') || 'https://vision54605927.cognitiveservices.azure.com'
  );
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem('azure_api_key') || '6T8n1bGozWj5GjP5jZJL53dXTeK1Y3FN8One3sKXzTgRGvuuexzYJQQJ99BIACqBBLyXJ3w3AAAFACOGJjcG'
  );

  const handleSave = () => {
    if (!endpoint.trim() || !apiKey.trim()) {
      toast.error('Please fill in both endpoint and API key');
      return;
    }

    // Validate endpoint format
    try {
      new URL(endpoint);
    } catch {
      toast.error('Please enter a valid endpoint URL');
      return;
    }

    localStorage.setItem('azure_endpoint', endpoint.trim());
    localStorage.setItem('azure_api_key', apiKey.trim());
    
    toast.success('API configuration updated successfully!');
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Computer Vision Endpoint</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://your-resource.cognitiveservices.azure.com"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your API key"
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiConfigDialog;