// Fix: Import Part type from @google/genai
import { GoogleGenAI, Modality, Part } from '@google/genai';

// Fix: Remove API key check and initialize client directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const fileToGenerativePart = async (base64Data: string) => {
  const pureBase64 = base64Data.split(',')[1];
  const mimeType = base64Data.split(';')[0].split(':')[1];
  return {
    inlineData: {
      data: pureBase64,
      mimeType,
    },
  };
};

// Fix: Create a robust function to find the image part in the response.
const findImagePart = (parts: Part[] | undefined): Part | undefined => {
    if (!parts) return undefined;
    return parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));
}

export const geminiService = {
  async removeBackground(base64Image: string): Promise<string> {
    try {
      const imagePart = await fileToGenerativePart(base64Image);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: 'Remove the background from this image, leaving only the main subject. Make the background transparent.',
            },
            imagePart,
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      // Fix: Use the robust findImagePart function to get the result.
      const imageOutputPart = findImagePart(response.candidates?.[0]?.content?.parts);
      if (imageOutputPart && imageOutputPart.inlineData) {
        const mimeType = imageOutputPart.inlineData.mimeType;
        const base64Data = imageOutputPart.inlineData.data;
        return `data:${mimeType};base64,${base64Data}`;
      }
      throw new Error('No image data in Gemini response');
    } catch (error) {
      console.error('Error removing background:', error);
      throw new Error('Failed to process image with AI. Please check the API key and try again.');
    }
  },

  async removeObject(base64ImageWithMask: string): Promise<string> {
    try {
      const imagePart = await fileToGenerativePart(base64ImageWithMask);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: 'In this image, an area is marked with a semi-transparent red color. Please remove the object underneath the red marking and fill the space by intelligently continuing the background. Provide the final image without the red marking.',
            },
            imagePart,
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      // Fix: Use the robust findImagePart function to get the result.
      const imageOutputPart = findImagePart(response.candidates?.[0]?.content?.parts);
       if (imageOutputPart && imageOutputPart.inlineData) {
        const mimeType = imageOutputPart.inlineData.mimeType;
        const base64Data = imageOutputPart.inlineData.data;
        return `data:${mimeType};base64,${base64Data}`;
      }
      throw new Error('No image data in Gemini response');
    } catch (error) {
      console.error('Error removing object:', error);
      throw new Error('Failed to process image with AI. Please check the API key and try again.');
    }
  },
  
  async applyEffect(base64Image: string, prompt: string): Promise<string> {
    try {
      const imagePart = await fileToGenerativePart(base64Image);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }, imagePart],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      // Fix: Use the robust findImagePart function to get the result.
      const imageOutputPart = findImagePart(response.candidates?.[0]?.content?.parts);
      if (imageOutputPart && imageOutputPart.inlineData) {
        const mimeType = imageOutputPart.inlineData.mimeType;
        const base64Data = imageOutputPart.inlineData.data;
        return `data:${mimeType};base64,${base64Data}`;
      }
      throw new Error('No image data in Gemini response');
    } catch (error) {
      console.error('Error applying effect:', error);
      throw new Error('Failed to process image with AI. Please check the API key and try again.');
    }
  },
};
