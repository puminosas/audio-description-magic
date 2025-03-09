
export function formatVoiceName(voiceName: string, gender?: string): string {
  const nameParts = voiceName.split('-');
  const voiceId = nameParts[nameParts.length - 1];
  
  // Determine voice type with better labeling
  let voiceType = '';
  let qualityLabel = '';
  
  if (voiceName.includes('Studio')) {
    voiceType = 'Studio';
    qualityLabel = '(Premium+)';
  } else if (voiceName.includes('Neural2')) {
    voiceType = 'Neural2';
    qualityLabel = '(Premium)';
  } else if (voiceName.includes('Wavenet')) {
    voiceType = 'Wavenet';
    qualityLabel = '(Enhanced)';
  } else if (voiceName.includes('Polyglot')) {
    voiceType = 'Polyglot';
    qualityLabel = '(Multi-lingual)';
  } else if (voiceName.includes('Standard')) {
    voiceType = 'Standard';
    qualityLabel = '';
  } else {
    // For any other voice types we might encounter
    voiceType = nameParts[nameParts.length - 2] || 'Voice';
  }
  
  // Determine gender label
  let genderLabel = 'Male';
  if (gender === 'female' || gender === 'FEMALE') {
    genderLabel = 'Female';
  } else if (gender === 'neutral' || gender === 'NEUTRAL') {
    genderLabel = 'Neutral';
  }
  
  // Format the final name
  return `${voiceType} ${voiceId} ${qualityLabel} (${genderLabel})`.trim().replace(/\s+/g, ' ');
}

// Add more utility functions as needed for the voice selector
export function getVoiceGenderIcon(gender: string): string {
  if (gender === 'female' || gender === 'FEMALE') {
    return 'female';
  } else if (gender === 'neutral' || gender === 'NEUTRAL') {
    return 'neutral';
  }
  return 'male';
}

export function getVoiceQualityBadge(voiceName: string): string | null {
  if (voiceName.includes('Studio')) {
    return 'Premium+';
  } else if (voiceName.includes('Neural2')) {
    return 'Premium';
  } else if (voiceName.includes('Wavenet')) {
    return 'Enhanced';
  } else if (voiceName.includes('Polyglot')) {
    return 'Multi-lingual';
  } else if (voiceName.includes('Standard')) {
    return 'Standard';
  }
  return null;
}

export function isPremiumVoice(voiceName: string): boolean {
  return (
    voiceName.includes('Studio') || 
    voiceName.includes('Neural2') || 
    voiceName.includes('Wavenet')
  );
}

export function getVoiceQuality(voiceName: string): number {
  if (voiceName.includes('Studio')) {
    return 4; // Highest quality
  } else if (voiceName.includes('Neural2')) {
    return 3; // High quality
  } else if (voiceName.includes('Wavenet')) {
    return 2; // Better quality
  } else if (voiceName.includes('Polyglot')) {
    return 1; // Specialized quality
  }
  return 0; // Standard quality
}
