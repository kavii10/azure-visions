import { useState } from "react";
import { User, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApiConfigDialog from "@/components/ApiConfigDialog";
import logo from "@/assets/pixalyze-logo.jpg";

const Navigation = () => {
  const [showApiDialog, setShowApiDialog] = useState(false);

  return (
    <div className="w-full">
      {/* Top Navigation */}
      <nav className="glass-card px-6 py-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Pixalyze logo" className="w-6 h-6 rounded" />
            </div>
            <h1 className="text-xl font-bold font-brand bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pixalyze
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="glow-primary">
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="glow-primary">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Menu Bar */}
      <div className="glass-card px-4 py-2">
        <div className="flex space-x-1">
          {['File', 'Edit', 'View', 'Settings', 'Help'].map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-glass-border/30"
            >
              {item}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-glass-border/30"
            onClick={() => setShowApiDialog(true)}
          >
            API
          </Button>
        </div>
      </div>

      <ApiConfigDialog 
        open={showApiDialog} 
        onOpenChange={setShowApiDialog} 
      />
    </div>
  );
};

export default Navigation;