import { useState, useEffect } from 'react';
import { Volume2, Eye, EyeOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatResults, AnalysisResult } from '@/services/azureVisionService';
import { translateText, getSpeechLanguageCode } from '@/services/translationService';
import { toast } from 'sonner';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  onToggleObjects: (show: boolean) => void;
  showObjects: boolean;
}

const ResultsDisplay = ({ result, onToggleObjects, showObjects }: ResultsDisplayProps) => {
  const [language, setLanguage] = useState('en');
  const [translatedContent, setTranslatedContent] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Translate content when language changes
  useEffect(() => {
    const translateContent = async () => {
      if (!result || language === 'en') {
        setTranslatedContent(null);
        return;
      }

      setIsTranslating(true);
      try {
        const formatted = formatResults(result);
        const translated: any = { ...formatted };

        // Translate title
        if (formatted.title) {
          translated.title = await translateText(formatted.title, language);
        }

        // Translate description
        if ('description' in formatted && formatted.description) {
          translated.description = await translateText(formatted.description, language);
        }

        // Translate captions
        if ('captions' in formatted && formatted.captions) {
          translated.captions = await Promise.all(
            formatted.captions.map(async (cap: any) => ({
              ...cap,
              text: await translateText(cap.text, language)
            }))
          );
        }

        // Translate object names
        if ('objects' in formatted && formatted.objects) {
          translated.objects = await Promise.all(
            formatted.objects.map(async (obj: any) => ({
              ...obj,
              object: await translateText(obj.object, language)
            }))
          );
        }

        // Translate tags
        if ('tags' in formatted && formatted.tags) {
          translated.tags = await Promise.all(
            formatted.tags.map(async (tag: any) => ({
              ...tag,
              name: await translateText(tag.name, language)
            }))
          );
        }

        // Translate items
        if ('items' in formatted && formatted.items) {
          translated.items = await Promise.all(
            formatted.items.map(async (item: any) => ({
              ...item,
              name: await translateText(item.name, language)
            }))
          );
        }

        // Translate categories
        if ('categories' in formatted && formatted.categories) {
          translated.categories = await Promise.all(
            formatted.categories.map(async (cat: any) => ({
              ...cat,
              name: await translateText(cat.name, language)
            }))
          );
        }

        setTranslatedContent(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        toast.error('Translation failed');
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [result, language]);

  const handleReadAloud = () => {
    if (!result) return;

    const content = translatedContent || formatResults(result);
    let textToRead = content.title + '. ';

    if ('description' in content && content.description) {
      textToRead += content.description + '. ';
    }

    if ('items' in content && content.items) {
      textToRead += `Tags: ${content.items.map((item: any) => item.name).join(', ')}.`;
    }

    if ('captions' in content && content.captions) {
      textToRead += `Captions: ${content.captions.map((cap: any) => cap.text).join('. ')}.`;
    }

    if ('objects' in content && content.objects) {
      textToRead += `Objects detected: ${content.objects.map((obj: any) => obj.object).join(', ')}.`;
    }

    // Use Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = getSpeechLanguageCode(language);
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

  const displayContent = translatedContent || formatResults(result);

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
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ta">Tamil</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="te">Telugu</SelectItem>
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
        <h4 className="text-xl font-bold text-primary mb-4">
          {displayContent.title}
          {isTranslating && <span className="ml-2 text-sm text-muted-foreground">(Translating...)</span>}
        </h4>

        {/* Description for analysis types */}
        {'description' in displayContent && displayContent.description && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-2">Description</h5>
            <p className="text-foreground bg-primary/10 p-4 rounded-lg">
              {displayContent.description}
              {'confidence' in displayContent && typeof displayContent.confidence === 'number' && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({Math.round((displayContent.confidence as number) * 100)}% confidence)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Dense Captions */}
        {'captions' in displayContent && displayContent.captions && displayContent.captions.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-3">Dense Captions</h5>
            <ul className="space-y-2">
              {displayContent.captions.map((caption: any, index: number) => (
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
        {'objects' in displayContent && displayContent.objects && displayContent.objects.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-3">Detected Objects</h5>
            <div className="space-y-2">
              {displayContent.objects.map((obj: any, index: number) => (
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
        {'categories' in displayContent && displayContent.categories && displayContent.categories.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-3">Categories</h5>
            <div className="flex flex-wrap gap-2">
              {displayContent.categories.map((category: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {category.name} ({Math.round(category.confidence * 100)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {'tags' in displayContent && displayContent.tags && displayContent.tags.length > 0 && (
          <div>
            <h5 className="font-semibold text-foreground mb-3">Tags</h5>
            <div className="flex flex-wrap gap-2">
              {displayContent.tags.map((tag: any, index: number) => (
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
        {'items' in displayContent && displayContent.items && displayContent.items.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {displayContent.items.map((item: any, index: number) => (
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