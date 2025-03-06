
// Format voice names to be more human-readable
export function formatVoiceName(voiceName: string, genderOverride?: string): string {
  // Extract relevant parts
  const nameParts = voiceName.split('-');
  const voiceId = nameParts[nameParts.length - 1];
  
  // Determine voice type
  let voiceType = '';
  if (voiceName.includes('Wavenet')) {
    voiceType = 'Wavenet';
  } else if (voiceName.includes('Neural2')) {
    voiceType = 'Neural2';
  } else if (voiceName.includes('Standard')) {
    voiceType = 'Standard';
  } else if (voiceName.includes('Polyglot')) {
    voiceType = 'Polyglot';
  } else if (voiceName.includes('Studio')) {
    voiceType = 'Studio';
  }
  
  // If we can't determine voice type from name parts, default to Standard
  if (!voiceType) {
    // Check if it's a special voice with additional information
    const languageCode = nameParts.slice(0, 2).join('-');
    const restOfName = nameParts.slice(2).join('-');
    
    if (restOfName) {
      voiceType = restOfName;
    } else {
      voiceType = 'Standard';
    }
  }
  
  // Determine gender (for display purposes)
  const gender = genderOverride === 'female' ? 'Female' : 'Male';
  
  return `${voiceType} ${voiceId} (${gender})`;
}

// Filter voices by gender
export function filterVoicesByGender(voices: any[], gender: string) {
  return voices.filter(voice => {
    if (gender === 'male') {
      return voice.gender === 'MALE' || voice.gender === 'male';
    } else if (gender === 'female') {
      return voice.gender === 'FEMALE' || voice.gender === 'female';
    } else if (gender === 'neutral') {
      return voice.gender === 'NEUTRAL' || voice.gender === 'neutral';
    }
    return true;
  });
}

// Sort voices by name
export function sortVoicesByName(voices: any[]) {
  return [...voices].sort((a, b) => {
    // First sort by voice type (Wavenet, Neural2, Standard, etc.)
    const typeA = getVoiceTypeRank(a.name);
    const typeB = getVoiceTypeRank(b.name);
    
    if (typeA !== typeB) {
      return typeA - typeB;
    }
    
    // Then sort by name
    return a.name.localeCompare(b.name);
  });
}

// Helper to rank voice types for sorting
function getVoiceTypeRank(voiceName: string): number {
  if (voiceName.includes('Studio')) return 1;
  if (voiceName.includes('Neural2')) return 2;
  if (voiceName.includes('Wavenet')) return 3;
  if (voiceName.includes('Polyglot')) return 4;
  if (voiceName.includes('Standard')) return 5;
  return 6; // Default for other types
}
