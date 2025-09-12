import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = 'Analyzing image...' }: LoadingSpinnerProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-8 text-center max-w-sm mx-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 mx-auto">
            <Loader2 className="w-full h-full text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-t-secondary rounded-full animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">AI Processing</h3>
        <p className="text-muted-foreground text-sm">{message}</p>
        
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;