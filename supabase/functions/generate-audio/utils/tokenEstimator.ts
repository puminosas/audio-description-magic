
// Token counter for OpenAI (approximate)
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ~= 4 chars in English
  return Math.ceil(text.length / 4);
}
