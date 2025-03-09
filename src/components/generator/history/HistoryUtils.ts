
import { useToast } from '@/hooks/use-toast';

export const useHistoryUtils = () => {
  const { toast } = useToast();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
