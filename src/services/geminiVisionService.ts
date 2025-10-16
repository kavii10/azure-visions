// Google Gemini AI Vision Service
import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => 
  localStorage.getItem('gemini_api_key') || "AIzaSyD_5BSvYlxsTP1dLG7Dmz65rokrfCooRy4";

export interface AnalysisResult {
  type: 'tags' | 'denseCaptions' | 'analysis' | 'objects';
  data: any;
}

export interface AnalysisOptions {
  visualFeatures: string[];
  language?: string;
}

// Map feature types to analysis prompts
export const getAnalysisOptions = (type: string): AnalysisOptions => {
  switch (type) {
    case 'tags':
      return { visualFeatures: ['Tags'] };
    case 'denseCaptions':
      return { visualFeatures: ['Caption', 'DenseCaptions', 'Tags'] };
    case 'analysis':
      return { visualFeatures: ['Caption', 'Tags'] };
    case 'objects':
      return { visualFeatures: ['Objects', 'Tags'] };
    default:
      return { visualFeatures: ['Tags'] };
  }
};

// Convert File to base64 data URI
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Generate appropriate prompt based on analysis type
const getPromptForType = (type: string): string => {
  switch (type) {
    case 'tags':
      return `Analyze this image and provide tags. Return a JSON object with this exact structure:
{
  "tagsResult": {
    "values": [
      {"name": "tag1", "confidence": 0.95},
      {"name": "tag2", "confidence": 0.90}
    ]
  }
}
Provide at least 5-10 relevant tags with confidence scores between 0 and 1.`;

    case 'denseCaptions':
      return `Analyze this image in detail. Return a JSON object with this exact structure:
{
  "captionResult": {
    "text": "overall image description",
    "confidence": 0.95
  },
  "denseCaptionsResult": {
    "values": [
      {
        "text": "description of region 1",
        "confidence": 0.92,
        "boundingBox": {"x": 0, "y": 0, "w": 100, "h": 100}
      }
    ]
  },
  "tagsResult": {
    "values": [
      {"name": "tag1", "confidence": 0.95}
    ]
  }
}
Provide a main caption, 3-5 dense captions for different regions, and relevant tags.`;

    case 'analysis':
      return `Analyze this image comprehensively. Return a JSON object with this exact structure:
{
  "captionResult": {
    "text": "detailed description of the image",
    "confidence": 0.95
  },
  "tagsResult": {
    "values": [
      {"name": "tag1", "confidence": 0.95},
      {"name": "tag2", "confidence": 0.90}
    ]
  }
}
Provide a detailed description and relevant tags.`;

    case 'objects':
      return `Detect and identify objects in this image. Return a JSON object with this exact structure:
{
  "objectsResult": {
    "values": [
      {
        "tags": [{"name": "object_name", "confidence": 0.95}],
        "boundingBox": {"x": 10, "y": 20, "w": 100, "h": 150}
      }
    ]
  },
  "tagsResult": {
    "values": [
      {"name": "tag1", "confidence": 0.95}
    ]
  }
}
Identify all visible objects with their bounding boxes and provide general tags.`;

    default:
      return 'Analyze this image and provide relevant tags.';
  }
};

// Analyze image from file upload
export const analyzeImage = async (file: File, options: AnalysisOptions): Promise<AnalysisResult> => {
  try {
    const genAI = new GoogleGenerativeAI(getApiKey());
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imagePart = await fileToGenerativePart(file);
    const type = options.visualFeatures.includes('Objects') ? 'objects' 
               : options.visualFeatures.includes('DenseCaptions') ? 'denseCaptions'
               : options.visualFeatures.includes('Caption') ? 'analysis'
               : 'tags';
    
    const prompt = getPromptForType(type);
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    return { type, data };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Analyze image from URL
export const analyzeImageFromUrl = async (imageUrl: string, options: AnalysisOptions): Promise<AnalysisResult> => {
  try {
    // Fetch the image and convert to blob, then to File
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });
    
    return await analyzeImage(file, options);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Validate a URL points to an image
export const validateImageUrl = async (url: string): Promise<boolean> => {
  const hasImageExt = /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url);
  if (hasImageExt) return true;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return !!contentType && contentType.startsWith('image/');
  } catch {
    return false;
  }
};

// Normalized formatter for UI (same as Azure format)
export const formatResults = (result: AnalysisResult) => {
  const d = result.data || {};
  switch (result.type) {
    case 'tags':
      return {
        title: 'Image Tags',
        items: d.tagsResult?.values?.map((tag: any) => ({ name: tag.name, confidence: tag.confidence })) || [],
      };

    case 'denseCaptions':
      return {
        title: 'Dense Captions',
        description: d.captionResult?.text || 'No description available',
        captions: d.denseCaptionsResult?.values?.map((c: any) => ({
          text: c.text,
          confidence: c.confidence,
          boundingBox: c.boundingBox,
        })) || [],
        tags: d.tagsResult?.values?.map((t: any) => ({ name: t.name, confidence: t.confidence })) || [],
      };

    case 'analysis':
      return {
        title: 'Image Analysis',
        description: d.captionResult?.text || 'No description available',
        confidence: d.captionResult?.confidence || 0,
        categories: [],
        tags: d.tagsResult?.values?.map((t: any) => ({ name: t.name, confidence: t.confidence })) || [],
      };

    case 'objects':
      return {
        title: 'Object Detection',
        objects: d.objectsResult?.values?.map((o: any) => ({
          object: o.tags?.[0]?.name || 'object',
          confidence: o.tags?.[0]?.confidence ?? o.confidence ?? 0,
          rectangle: o.boundingBox,
        })) || [],
        tags: d.tagsResult?.values?.map((t: any) => ({ name: t.name, confidence: t.confidence })) || [],
      };

    default:
      return { title: 'Unknown', items: [] };
  }
};
