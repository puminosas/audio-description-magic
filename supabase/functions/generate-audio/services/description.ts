
import { corsHeaders } from "../../_shared/cors.ts";

// Generate description using OpenAI
export async function generateDescription(
  text: string, 
  language: string, 
  needsFullDescription: boolean,
  openaiApiKey: string
) {
  console.log(`Generating ${needsFullDescription ? 'detailed' : 'enhanced'} description with OpenAI...`);
  const maxTokens = needsFullDescription ? 500 : 300; // Limit tokens based on input type
  
  const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Use smaller model to reduce costs
      messages: [
        { 
          role: "system", 
          content: "You are a professional copywriter specializing in creating concise, engaging e-commerce product descriptions for audio playback."
        },
        { 
          role: "user", 
          content: `Create a ${needsFullDescription ? 'detailed' : 'brief enhanced'} audio description for: "${text}". 
          
The description should:
1. Be clear and concise
2. Highlight key features and benefits
3. Use natural language optimized for speech
4. Be in ${language} language
5. ${needsFullDescription ? 'Be between 100-200 words' : 'Be no more than 100 words'}

Make it sound professional and engaging.`
        }
      ],
      temperature: 0.7,
      max_tokens: maxTokens
    })
  });

  if (!descriptionResponse.ok) {
    const errorText = await descriptionResponse.text();
    console.error("OpenAI API error:", errorText);
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  // Parse the JSON response
  const descriptionData = await descriptionResponse.json();
  const generatedDescription = descriptionData.choices[0]?.message?.content?.trim();

  if (!generatedDescription) {
    console.error("No description generated", descriptionData);
    throw new Error("Failed to generate a description");
  }

  console.log("Generated Description:", generatedDescription.substring(0, 100) + "...");
  console.log("Description length:", generatedDescription.length, "characters");
  
  return generatedDescription;
}
