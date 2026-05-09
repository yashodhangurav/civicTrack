import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function classifyComplaint(description: string, imageUrls?: string[]) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No Gemini API key provided. Using fallback classification.");
      return { category: "General", priority: "MEDIUM", summary: description };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze the following civic complaint and categorize it.
      Return ONLY a JSON object with this exact structure:
      {
        "category": "String (e.g. Garbage, Pothole, Water, Electricity, General)",
        "priority": "String (LOW, MEDIUM, HIGH, CRITICAL)",
        "summary": "String (A 1-sentence summary of the issue)"
      }
      
      Complaint Description: "${description}"
    `;

    // Note: If imageUrls are provided, we'd normally fetch them and pass them as inlineData parts.
    // For this boilerplate, we'll just pass the text prompt.
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON output
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { category: "General", priority: "MEDIUM", summary: description };
  } catch (error) {
    console.error("AI Classification Error:", error);
    return { category: "General", priority: "MEDIUM", summary: description };
  }
}
