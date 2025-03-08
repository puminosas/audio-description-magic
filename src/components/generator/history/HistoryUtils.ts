
import { useToast } from '@/hooks/use-toast';

export const useHistoryUtils = () => {
  const { toast } = useToast();

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown date';
    
    try {
      // Convert string dates to Date objects
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if dateObj is valid before formatting
      if (Number.isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const copyEmbedCode = (id: string, audioUrl: string) => {
    const embedCode = `<audio id="audiodesc-${id}" controls><source src="${audioUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
    
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({
          title: 'Copied!',
          description: 'Embed code copied to clipboard',
        });
      })
      .catch(err => {
        console.error('Error copying text:', err);
        toast({
          title: 'Error',
          description: 'Failed to copy embed code',
          variant: 'destructive',
        });
      });
  };

  return {
    formatDate,
    copyEmbedCode
  };
};
