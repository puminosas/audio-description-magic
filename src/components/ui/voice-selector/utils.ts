
export function formatVoiceName(voiceName: string, gender?: string): string {
  const nameParts = voiceName.split('-');
  const voiceId = nameParts[nameParts.length - 1];
  
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
  
  return `${voiceType} ${voiceId} (${gender === 'female' ? 'Female' : 'Male'})`;
}

// Add more utility functions as needed for the voice selector
export function getVoiceGenderIcon(gender: string): string {
  return gender === 'female' ? 'female' : 'male';
}

export function getVoiceQualityBadge(voiceName: string): string | null {
  if (voiceName.includes('Neural2')) {
    return 'Premium';
  } else if (voiceName.includes('Wavenet')) {
    return 'High';
  } else if (voiceName.includes('Standard')) {
    return 'Standard';
  }
  return null;
}
