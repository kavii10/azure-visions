// Azure AI Vision API Service
const AZURE_ENDPOINT = "https://vision54605927.cognitiveservices.azure.com";
const API_KEY = "6T8n1bGozWj5GjP5jZJL53dXTeK1Y3FN8One3sKXzTgRGvuuexzYJQQJ99BIACqBBLyXJ3w3AAAFACOGJjcG";
const API_VERSION = "2023-10-01";

export interface AnalysisResult {
  type: 'tags' | 'denseCaptions' | 'analysis' | 'objects';
  data: any;
}

export interface AnalysisOptions {
  visualFeatures: string[];
  language?: string;
}

// Get analysis options for different feature types
export const getAnalysisOptions = (type: string): AnalysisOptions => {
  switch (type) {
    case 'tags':
      return { visualFeatures: ['Tags'] };
    case 'denseCaptions':
      return { visualFeatures: ['DenseCaptions', 'Description', 'Tags'] };
    case 'analysis':
      return { visualFeatures: ['Description', 'Categories', 'Tags'] };
    case 'objects':
      return { visualFeatures: ['Objects', 'Tags'] };
    default:
      return { visualFeatures: ['Tags'] };
  }
};

// Analyze image from file upload
export const analyzeImage = async (file: File, options: AnalysisOptions): Promise<AnalysisResult> => {
  const features = options.visualFeatures.join(',');
  const url = `${AZURE_ENDPOINT}/vision/v3.2/analyze?visualFeatures=${features}&language=${options.language || 'en'}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure Vision API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Determine result type based on features
  let type: AnalysisResult['type'] = 'tags';
  if (features.includes('Objects')) {
    type = 'objects';
  } else if (features.includes('DenseCaptions')) {
    type = 'denseCaptions';
  } else if (features.includes('Description')) {
    type = 'analysis';
  }

  return { type, data };
};

// Analyze image from URL
export const analyzeImageFromUrl = async (imageUrl: string, options: AnalysisOptions): Promise<AnalysisResult> => {
  const features = options.visualFeatures.join(',');
  const url = `${AZURE_ENDPOINT}/vision/v3.2/analyze?visualFeatures=${features}&language=${options.language || 'en'}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure Vision API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Determine result type based on features
  let type: AnalysisResult['type'] = 'tags';
  if (features.includes('Objects')) {
    type = 'objects';
  } else if (features.includes('DenseCaptions')) {
    type = 'denseCaptions';
  } else if (features.includes('Description')) {
    type = 'analysis';
  }

  return { type, data };
};

// Helper function to validate image URL
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') || false;
  } catch {
    return false;
  }
};

// Helper function to format analysis results
export const formatResults = (result: AnalysisResult) => {
  switch (result.type) {
    case 'tags':
      return {
        title: 'Image Tags',
        items: result.data.tags?.map((tag: any) => ({
          name: tag.name,
          confidence: tag.confidence,
        })) || [],
      };
    
    case 'denseCaptions':
      return {
        title: 'Dense Captions',
        description: result.data.description?.captions?.[0]?.text || 'No description available',
        captions: result.data.denseCaptions?.values?.map((caption: any) => ({
          text: caption.text,
          confidence: caption.confidence,
          boundingBox: caption.boundingBox,
        })) || [],
        tags: result.data.tags?.map((tag: any) => ({
          name: tag.name,
          confidence: tag.confidence,
        })) || [],
      };
    
    case 'analysis':
      return {
        title: 'Image Analysis',
        description: result.data.description?.captions?.[0]?.text || 'No description available',
        confidence: result.data.description?.captions?.[0]?.confidence || 0,
        categories: result.data.categories?.map((cat: any) => ({
          name: cat.name,
          confidence: cat.score,
        })) || [],
        tags: result.data.tags?.map((tag: any) => ({
          name: tag.name,
          confidence: tag.confidence,
        })) || [],
      };
    
    case 'objects':
      return {
        title: 'Object Detection',
        objects: result.data.objects?.map((obj: any) => ({
          object: obj.object,
          confidence: obj.confidence,
          rectangle: obj.rectangle,
        })) || [],
        tags: result.data.tags?.map((tag: any) => ({
          name: tag.name,
          confidence: tag.confidence,
        })) || [],
      };
    
    default:
      return { title: 'Unknown', items: [] };
  }
};