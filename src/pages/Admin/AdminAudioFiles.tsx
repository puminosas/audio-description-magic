
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseTyped } from '@/utils/supabaseHelper';
import AudioFilesFilter from '@/components/admin/AudioFilesFilter';
import AudioFilesTable from '@/components/admin/AudioFilesTable';
import AudioFilesPagination from '@/components/admin/AudioFilesPagination';

const AdminAudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState([]);
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
      
      // First get the count
      const { data: countData, error: countError } = await supabaseTyped.audio_files.select();
      
      if (countError) throw countError;
      setTotalCount(countData?.length || 0);
      
      // Then get the data and do client-side ordering
      const { data, error } = await supabaseTyped.audio_files.select();
      
      if (error) throw error;
      
      // Sort data by created_at in descending order
      const sortedData = data ? [...data].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }) : [];
      
      // Apply manual pagination
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedData = sortedData.slice(start, end);
      
      setAudioFiles(paginatedData);
    } catch (error) {
      console.error('Error loading audio files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audio files.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudioFiles();
  }, [page]);

  const handleDeleteAudio = async (id) => {
    if (!confirm('Are you sure you want to delete this audio file?')) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabaseTyped.audio_files
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAudioFiles(audioFiles.filter(file => file.id !== id));
      
      toast({
        title: 'Success',
        description: 'Audio file deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting audio file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete audio file.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAudioFiles = audioFiles.filter(file => {
    const matchesSearch = 
      file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = !filterLanguage || filterLanguage === 'all' || file.language === filterLanguage;
    const matchesVoice = !filterVoice || filterVoice === 'all' || file.voice_name === filterVoice;
    
    return matchesSearch && matchesLanguage && matchesVoice;
  });

  const languages = [...new Set(audioFiles.map(file => file.language).filter(Boolean))];
  const voices = [...new Set(audioFiles.map(file => file.voice_name).filter(Boolean))];

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterLanguage('');
    setFilterVoice('');
  };

  return (
    <div className="space-y-4">
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
            audioFiles={filteredAudioFiles}
            onDelete={handleDeleteAudio}
          />
          
          <AudioFilesPagination 
            page={page}
            setPage={setPage}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
};

export default AdminAudioFiles;
