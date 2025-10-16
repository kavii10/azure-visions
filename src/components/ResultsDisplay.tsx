import { useState } from 'react';
import { Volume2, Eye, EyeOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatResults, AnalysisResult } from '@/services/geminiVisionService';
import { toast } from 'sonner';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  onToggleObjects: (show: boolean) => void;
  showObjects: boolean;
}

const ResultsDisplay = ({ result, onToggleObjects, showObjects }: ResultsDisplayProps) => {
  const [language, setLanguage] = useState('en-US');

  const handleReadAloud = () => {
    if (!result) return;

    const formatted = formatResults(result);
    let textToRead = formatted.title + '. ';

    if ('description' in formatted && formatted.description) {
      textToRead += formatted.description + '. ';
    }

    if ('items' in formatted && formatted.items) {
      textToRead += `Tags: ${formatted.items.map((item: any) => item.name).join(', ')}.`;
    }

    if ('captions' in formatted && formatted.captions) {
      textToRead += `Captions: ${formatted.captions.map((cap: any) => cap.text).join('. ')}.`;
    }

    if ('objects' in formatted && formatted.objects) {
      textToRead += `Objects detected: ${formatted.objects.map((obj: any) => obj.object).join(', ')}.`;
    }

    // Use Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
      toast.success('Reading aloud...');
    } else {
      toast.error('Text-to-speech not supported in your browser');
    }
  };

  if (!result) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No analysis results yet</p>
          <p className="text-sm text-muted-foreground">Select an image and choose an analysis type</p>
        </div>
      </div>
    );
  }

  const formatted = formatResults(result);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
        
        <div className="flex items-center space-x-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English</SelectItem>
              <SelectItem value="es-ES">Spanish</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
              <SelectItem value="de-DE">German</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleReadAloud} className="glow-primary">
            <Volume2 className="w-4 h-4 mr-2" />
            Read Aloud
          </Button>

          {result.type === 'objects' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleObjects(!showObjects)}
              className="glow-primary"
            >
              {showObjects ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showObjects ? 'Hide' : 'Show'} Objects
            </Button>
          )}
        </div>
      </div>

      <div className="glass-card p-6 fade-in">
        <h4 className="text-xl font-bold text-primary mb-4">{formatted.title}</h4>

        {/* Description for analysis types */}
        {'description' in formatted && formatted.description && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-2">Description</h5>
            <p className="text-foreground bg-primary/10 p-4 rounded-lg">
              {formatted.description}
              {'confidence' in formatted && typeof formatted.confidence === 'number' && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({Math.round((formatted.confidence as number) * 100)}% confidence)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Dense Captions */}
        {'captions' in formatted && formatted.captions && formatted.captions.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-3">Dense Captions</h5>
            <ul className="space-y-2">
              {formatted.captions.map((caption: any, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">
                    {caption.text}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({Math.round(caption.confidence * 100)}%)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Objects */}
        {'objects' in formatted && formatted.objects && formatted.objects.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-3">Detected Objects</h5>
            <div className="space-y-2">
              {formatted.objects.map((obj: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                  <span className="font-medium text-foreground">{obj.object}</span>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(obj.confidence * 100)}% confidence
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {'categories' in formatted && formatted.categories && formatted.categories.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-3">Categories</h5>
            <div className="flex flex-wrap gap-2">
              {formatted.categories.map((category: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {category.name} ({Math.round(category.confidence * 100)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {'tags' in formatted && formatted.tags && formatted.tags.length > 0 && (
          <div>
            <h5 className="font-semibold text-foreground mb-3">Tags</h5>
            <div className="flex flex-wrap gap-2">
              {formatted.tags.map((tag: any, index: number) => (
                <Badge
                  key={index}
                  className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                >
                  {tag.name} ({Math.round(tag.confidence * 100)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Items (for basic tags) */}
        {'items' in formatted && formatted.items && formatted.items.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {formatted.items.map((item: any, index: number) => (
                <Badge
                  key={index}
                  className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                >
                  {item.name} ({Math.round(item.confidence * 100)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;