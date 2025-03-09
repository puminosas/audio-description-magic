
export function formatVoiceName(voiceName: string, gender?: string): string {
  const nameParts = voiceName.split('-');
  const voiceId = nameParts[nameParts.length - 1];
  
  let voiceType = '';
  if (voiceName.includes('Studio')) {
    voiceType = 'Studio';
  } else if (voiceName.includes('Neural2')) {
    voiceType = 'Neural2';
  } else if (voiceName.includes('Wavenet')) {
    voiceType = 'Wavenet';
  } else if (voiceName.includes('Polyglot')) {
    voiceType = 'Polyglot';
  } else if (voiceName.includes('Standard')) {
    voiceType = 'Standard';
  }
  
  let genderLabel = 'Male';
  if (gender === 'female') {
    genderLabel = 'Female';
  } else if (gender === 'neutral') {
    genderLabel = 'Neutral';
  }
  
  return `${voiceType} ${voiceId} (${genderLabel})`;
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
    return 3; // Highest quality
  } else if (voiceName.includes('Neural2')) {
    return 2; // High quality
  } else if (voiceName.includes('Wavenet')) {
    return 1; // Better quality
  }
  return 0; // Standard quality
}
