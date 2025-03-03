
export function formatVoiceName(voiceName: string, gender?: string): string {
  const nameParts = voiceName.split('-');
  const voiceId = nameParts[nameParts.length - 1];
  const voiceType = voiceName.includes('Wavenet') ? 'Wavenet' : 
                   voiceName.includes('Neural2') ? 'Neural2' : 
                   voiceName.includes('Standard') ? 'Standard' : '';
  
  return `${voiceType} ${voiceId} (${gender === 'female' ? 'Female' : 'Male'})`;
}
