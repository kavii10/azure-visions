// Azure AI Vision API Service (Image Analysis 4.0)
const getAzureEndpoint = () => 
  localStorage.getItem('azure_endpoint') || "https://vision54605927.cognitiveservices.azure.com";
const getApiKey = () => 
  localStorage.getItem('azure_api_key') || "6T8n1bGozWj5GjP5jZJL53dXTeK1Y3FN8One3sKXzTgRGvuuexzYJQQJ99BIACqBBLyXJ3w3AAAFACOGJjcG";
const API_VERSION = "2023-10-01";

export interface AnalysisResult {
  type: 'tags' | 'denseCaptions' | 'analysis' | 'objects';
  data: any;
}

export interface AnalysisOptions {
  visualFeatures: string[];
  language?: string;
}

// Map feature types to IA 4.0 features
export const getAnalysisOptions = (type: string): AnalysisOptions => {
  switch (type) {
    case 'tags':
      return { visualFeatures: ['Tags'] };
    case 'denseCaptions':
      return { visualFeatures: ['Caption', 'DenseCaptions', 'Tags'] };
    case 'analysis':
      // In IA 4.0, Description/Categories are replaced by Caption/Tags
      return { visualFeatures: ['Caption', 'Tags'] };
    case 'objects':
      return { visualFeatures: ['Objects', 'Tags'] };
    default:
      return { visualFeatures: ['Tags'] };
  }
};

const buildUrl = (features: string[], language?: string) => {
  const featureParam = encodeURIComponent(features.join(','));
  const lang = language || 'en';
  return `${getAzureEndpoint()}/computervision/imageanalysis:analyze?api-version=${API_VERSION}&features=${featureParam}&language=${lang}&gender-neutral-caption=true`;
};

// Analyze image from file upload
export const analyzeImage = async (file: File, options: AnalysisOptions): Promise<AnalysisResult> => {
  const url = buildUrl(options.visualFeatures, options.language);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': getApiKey(),
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
  const features = options.visualFeatures.join(',');
  let type: AnalysisResult['type'] = 'tags';
  if (features.includes('Objects')) type = 'objects';
  else if (features.includes('DenseCaptions')) type = 'denseCaptions';
  else if (features.includes('Caption')) type = 'analysis';

  return { type, data };
};

// Analyze image from URL
export const analyzeImageFromUrl = async (imageUrl: string, options: AnalysisOptions): Promise<AnalysisResult> => {
  const url = buildUrl(options.visualFeatures, options.language);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': getApiKey(),
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
  const features = options.visualFeatures.join(',');
  let type: AnalysisResult['type'] = 'tags';
  if (features.includes('Objects')) type = 'objects';
  else if (features.includes('DenseCaptions')) type = 'denseCaptions';
  else if (features.includes('Caption')) type = 'analysis';

  return { type, data };
};

// Validate a URL points to an image (best-effort)
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

// Normalized formatter for UI
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