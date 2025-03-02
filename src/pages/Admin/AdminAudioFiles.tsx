
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { useToast } from '@/hooks/use-toast';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { Loader2, Trash2, X, RefreshCw, Download } from 'lucide-react';

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
    
    const matchesLanguage = !filterLanguage || file.language === filterLanguage;
    const matchesVoice = !filterVoice || file.voice_name === filterVoice;
    
    return matchesSearch && matchesLanguage && matchesVoice;
  });

  const languages = [...new Set(audioFiles.map(file => file.language).filter(Boolean))];
  const voices = [...new Set(audioFiles.map(file => file.voice_name).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-[200px]">
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang || "unknown"}>{lang || "Unknown"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-[200px]">
          <Select value={filterVoice} onValueChange={setFilterVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Voices</SelectItem>
              {voices.map(voice => (
                <SelectItem key={voice} value={voice || "unknown"}>{voice || "Unknown"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={() => {
          setSearchTerm('');
          setFilterLanguage('');
          setFilterVoice('');
        }}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
        
        <Button variant="outline" onClick={loadAudioFiles}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Voice</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Audio</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredAudioFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No audio files found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAudioFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        {file.title}
                      </TableCell>
                      <TableCell>{file.language}</TableCell>
                      <TableCell>{file.voice_name}</TableCell>
                      <TableCell>
                        {new Date(file.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <AudioPlayer
                          audioUrl={file.audio_url}
                          fileName={file.title}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteAudio(file.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(file.audio_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * itemsPerPage + 1, totalCount)} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount} entries
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page * itemsPerPage >= totalCount}
                onClick={() => setPage(page => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAudioFiles;
