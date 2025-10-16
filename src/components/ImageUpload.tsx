import { useState, useCallback } from 'react';
import { Upload, Link, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { validateImageUrl } from '@/services/geminiVisionService';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onUrlSelect: (url: string) => void;
  uploadedFile: File | null;
  imageUrl: string;
}

const ImageUpload = ({ onFileSelect, onUrlSelect, uploadedFile, imageUrl }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('file');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onFileSelect(imageFile);
      toast.success('Image uploaded successfully!');
    } else {
      toast.error('Please upload a valid image file');
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
      toast.success('Image uploaded successfully!');
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleUrlSubmit = async () => {
    const url = urlInput.trim();
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
      const isImage = /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url) || (await validateImageUrl(url));
      if (!isImage) {
        toast.error('Please paste a direct image URL (e.g., .jpg, .png, .webp)');
        return;
      }
      onUrlSelect(url);
      toast.success('Image loaded from URL!');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const clearFile = () => {
    onFileSelect(null as any);
    setUrlInput('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Upload Image</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card">
          <TabsTrigger value="file" className="data-[state=active]:bg-primary/20">
            <Upload className="w-4 h-4 mr-2" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-primary/20">
            <Link className="w-4 h-4 mr-2" />
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div
            className={`upload-area ${dragOver ? 'dragover' : ''} p-8 text-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Drop your image here
                </p>
                <p className="text-muted-foreground mb-4">
                  or click to browse files
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild className="glow-primary">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
              </div>
              
              {uploadedFile && (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <span>{uploadedFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={clearFile}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Image URL
              </label>
              <div className="flex space-x-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button onClick={handleUrlSubmit} className="glow-primary">
                  Load
                </Button>
              </div>
            </div>
            
            {imageUrl && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <span className="truncate max-w-xs">{imageUrl}</span>
                <Button variant="ghost" size="sm" onClick={clearFile}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageUpload;