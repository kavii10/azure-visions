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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="text-center animate-fade-in">
        <img
          src={logo}
          alt="Pixalyze logo"
          className="w-24 h-24 mx-auto rounded-2xl shadow-2xl animate-scale-in"
          loading="eager"
        />
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold font-brand bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wide">
          Pixalyze
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">AI Image Analyzer</p>
      </div>
    </div>
  );
};

export default SplashScreen;
