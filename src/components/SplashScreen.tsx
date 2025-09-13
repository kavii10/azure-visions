import { useEffect } from "react";
import logo from "@/assets/pixalyze-logo.jpg";

interface SplashScreenProps {
  visible: boolean;
}

const SplashScreen = ({ visible }: SplashScreenProps) => {
  useEffect(() => {
    // noop – animation handled via CSS utilities
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-bounce-slow">
          <img
            src={logo}
            alt="Pixalyze logo"
            className="w-32 h-32 mx-auto rounded-3xl shadow-2xl animate-pulse-glow mb-8"
            loading="eager"
          />
        </div>
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-extrabold font-brand bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent tracking-wide animate-gradient-x">
            Pixalyze
          </h1>
          <p className="mt-4 text-lg text-muted-foreground animate-fade-in-delayed">AI Image Analyzer</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
