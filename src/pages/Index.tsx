import { useState } from 'react';
import Navigation from '@/components/Navigation';
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';
import FeatureButtons from '@/components/FeatureButtons';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import Footer from '@/components/Footer';
import { analyzeImage, analyzeImageFromUrl, getAnalysisOptions, AnalysisResult } from '@/services/azureVisionService';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-banner.jpg';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showObjects, setShowObjects] = useState(true);

  const handleFileSelect = (file: File | null) => {
    setUploadedFile(file);
    if (!file) {
      setImageUrl('');
      setAnalysisResult(null);
    }
  };

  const handleUrlSelect = (url: string) => {
    setImageUrl(url);
    setUploadedFile(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async (type: 'tags' | 'denseCaptions' | 'analysis' | 'objects') => {
    if (!uploadedFile && !imageUrl) {
      toast.error('Please upload an image or provide a URL first');
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const options = getAnalysisOptions(type);
      let result: AnalysisResult;

      if (uploadedFile) {
        result = await analyzeImage(uploadedFile, options);
      } else {
        result = await analyzeImageFromUrl(imageUrl, options);
      }

      setAnalysisResult(result);
      toast.success('Analysis completed successfully!');

      // Auto-show objects if it's object detection
      if (type === 'objects') {
        setShowObjects(true);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasImage = uploadedFile || imageUrl;

  return (
    <div className="min-h-screen bg-background">
      {isLoading && <LoadingSpinner />}
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Navigation />
        
        {/* Hero Section */}
        <div className="my-8 text-center">
          <div className="relative mb-6">
            <img 
              src={heroImage} 
              alt="AI Vision Technology" 
              className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  AI Image Analyzer
                </h1>
                <p className="text-xl md:text-2xl text-white/90 drop-shadow">
                  Powered by Azure Cognitive Services
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Panel - Upload */}
          <div className="space-y-6">
            <ImageUpload
              onFileSelect={handleFileSelect}
              onUrlSelect={handleUrlSelect}
              uploadedFile={uploadedFile}
              imageUrl={imageUrl}
            />
            
            <FeatureButtons
              onAnalyze={handleAnalyze}
              disabled={!hasImage}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel - Preview */}
          <div>
            <ImagePreview
              file={uploadedFile}
              imageUrl={imageUrl}
              analysisResult={analysisResult}
              showObjects={showObjects}
            />
          </div>
        </div>

        {/* Results Section */}
        <ResultsDisplay
          result={analysisResult}
          onToggleObjects={setShowObjects}
          showObjects={showObjects}
        />

        <Footer />
      </div>
    </div>
  );
};

export default Index;