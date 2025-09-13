import { Tag, FileText, Search, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureButtonsProps {
  onAnalyze: (type: 'tags' | 'denseCaptions' | 'analysis' | 'objects') => void;
  disabled: boolean;
  isLoading: boolean;
}

const FeatureButtons = ({ onAnalyze, disabled, isLoading }: FeatureButtonsProps) => {
  const features = [
    {
      id: 'tags' as const,
      title: 'Tag Extraction',
      description: 'Extract visual tags and features',
      icon: Tag,
      className: 'feature-orange text-white hover:opacity-90',
    },
    {
      id: 'denseCaptions' as const,
      title: 'Dense Captioning',
      description: 'Detailed image descriptions',
      icon: FileText,
      className: 'feature-green text-white hover:opacity-90',
    },
    {
      id: 'analysis' as const,
      title: 'Image Analysis',
      description: 'Comprehensive image analysis',
      icon: Search,
      className: 'feature-blue text-white hover:opacity-90',
    },
    {
      id: 'objects' as const,
      title: 'Object Detection',
      description: 'Detect and locate objects',
      icon: Target,
      className: 'feature-purple text-white hover:opacity-90',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Analysis Features</h3>
      
      <div className="flex flex-wrap gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          
          return (
            <Button
              key={feature.id}
              onClick={() => onAnalyze(feature.id)}
              disabled={disabled || isLoading}
              className="feature-blue text-white hover:opacity-90 p-4 h-auto flex-col space-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex-1"
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">{feature.title}</div>
                <div className="text-xs opacity-90">{feature.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureButtons;