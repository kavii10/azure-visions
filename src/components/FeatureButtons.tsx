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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          
          return (
            <Button
              key={feature.id}
              onClick={() => onAnalyze(feature.id)}
              disabled={disabled || isLoading}
              className={`${feature.className} p-6 h-auto flex-col space-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Icon className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">{feature.title}</div>
                <div className="text-sm opacity-90">{feature.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureButtons;