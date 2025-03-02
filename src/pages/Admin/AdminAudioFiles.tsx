
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AudioFilesFilter from '@/components/admin/AudioFilesFilter';
import AudioFilesTable from '@/components/admin/AudioFilesTable';
import AudioFilesPagination from '@/components/admin/AudioFilesPagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define a type for our audio files
interface AudioFile {
  id: string;
  title: string;
  description?: string;
  language: string;
  voice_name: string;
  created_at: string;
  audio_url: string;
  user_id?: string | null;
  is_temporary?: boolean;
  session_id?: string | null;
}

const AdminAudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [allAudioFiles, setAllAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterVoice, setFilterVoice] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  const loadAudioFiles = async () => {
    try {
      setLoading(true);
      
      // Use the actual Supabase client for more reliable data fetching
      // This avoids using the typed client which might be causing issues
      const { data, error, count } = await supabase
        .from('audio_files')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Fetched audio files:', data?.length || 0);
      setTotalCount(count || 0);
      
      if (data && data.length > 0) {
        setAllAudioFiles(data as AudioFile[]);
        
        // Apply manual pagination
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setAudioFiles(data.slice(start, end) as AudioFile[]);
      } else {
        setAllAudioFiles([]);
        setAudioFiles([]);
        console.log('No audio files found or data is empty');
      }
    } catch (error) {
      console.error('Error loading audio files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audio files. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudioFiles();
  }, []);

  useEffect(() => {
    if (allAudioFiles.length > 0) {
      // Apply filters
      const filteredFiles = allAudioFiles.filter(file => {
        const matchesSearch = 
          (file.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           file.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesLanguage = !filterLanguage || filterLanguage === 'all' || file.language === filterLanguage;
        const matchesVoice = !filterVoice || filterVoice === 'all' || file.voice_name === filterVoice;
        
        return matchesSearch && matchesLanguage && matchesVoice;
      });
      
      setTotalCount(filteredFiles.length);
      
      // Apply pagination to filtered results
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setAudioFiles(filteredFiles.slice(start, end));
    }
  }, [page, searchTerm, filterLanguage, filterVoice, allAudioFiles]);

  const handleDeleteAudio = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setAudioFiles(audioFiles.filter(file => file.id !== id));
      setAllAudioFiles(allAudioFiles.filter(file => file.id !== id));
      setTotalCount(prev => prev - 1);
      
      toast({
        title: 'Success',
        description: 'Audio file deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting audio file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete audio file. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterLanguage('');
    setFilterVoice('');
  };

  // Extract unique languages and voices from all audio files
  const languages = [...new Set(allAudioFiles.map(file => file.language).filter(Boolean))];
  const voices = [...new Set(allAudioFiles.map(file => file.voice_name).filter(Boolean))];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audio Files Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AudioFilesFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterLanguage={filterLanguage}
          setFilterLanguage={setFilterLanguage}
          filterVoice={filterVoice}
          setFilterVoice={setFilterVoice}
          languages={languages}
          voices={voices}
          onClearFilters={handleClearFilters}
          onRefresh={loadAudioFiles}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <AudioFilesTable 
              audioFiles={audioFiles}
              onDelete={handleDeleteAudio}
            />
            
            <AudioFilesPagination 
              page={page}
              setPage={handlePageChange}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAudioFiles;
