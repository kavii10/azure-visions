import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-12 glass-card p-4 text-center">
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <span>© 2024 AI Image Analyzer</span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-red-500 fill-current" />
          <span>by AI</span>
        </span>
        <span>•</span>
        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        <span>•</span>
        <a href="#" className="hover:text-primary transition-colors">Terms</a>
      </div>
    </footer>
  );
};

export default Footer;