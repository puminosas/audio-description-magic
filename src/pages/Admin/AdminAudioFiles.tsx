
import { useState, useEffect } from 'react';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Play,
  Pause,
  Download,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type AudioFile = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  language: string;
  voice_name: string;
  audio_url: string;
  duration: number | null;
  created_at: string;
  profiles?: {
    email: string;
  };
  user_email?: string;
};

const AdminAudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [deleteAudioId, setDeleteAudioId] = useState<string | null>(null);
  const filesPerPage = 10;
  const { toast } = useToast();
  const audioRef = useState<HTMLAudioElement>(new Audio())[0];

  useEffect(() => {
    fetchAudioFiles();
  }, [page, searchQuery, languageFilter]);

  useEffect(() => {
    // Audio event listeners
    const handleEnded = () => {
      setPlayingAudio(null);
    };

    audioRef.addEventListener('ended', handleEnded);

    return () => {
      audioRef.removeEventListener('ended', handleEnded);
      audioRef.pause();
    };
  }, []);

  const fetchAudioFiles = async () => {
    setLoading(true);
    try {
      let query = supabaseTyped.audio_files
        .select()
        .select('*, profiles:user_id(email)')
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (languageFilter !== 'all') {
        query = query.eq('language', languageFilter);
      }

      // Get count for pagination
      // Fix for the count argument issue - use head: true
      const { count } = await query.select('id', { count: 'exact' });
      
      setTotalFiles(count || 0);
      setTotalPages(Math.ceil((count || 0) / filesPerPage));

      // Get data for current page
      const { data, error } = await query
        .range((page - 1) * filesPerPage, page * filesPerPage - 1);

      if (error) throw error;

      // Transform data to include user email
      const transformedData = data.map((item: any) => ({
        ...item,
        user_email: item.profiles?.email
      }));

      setAudioFiles(transformedData);
    } catch (error) {
      console.error('Error fetching audio files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audio files.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      // Pause currently playing audio
      audioRef.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      audioRef.pause();
      
      // Play new audio
      audioRef.src = audioUrl;
      audioRef.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Failed to play audio file.',
          variant: 'destructive',
        });
      });
      setPlayingAudio(audioUrl);
    }
  };

  const handleDeleteAudio = async () => {
    if (!deleteAudioId) return;
    
    try {
      const { error } = await supabaseTyped.audio_files
        .delete()
        .eq('id', deleteAudioId);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Audio file deleted successfully.',
      });
      
      // Refresh audio files list
      fetchAudioFiles();
      setDeleteAudioId(null);
    } catch (error) {
      console.error('Error deleting audio file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete audio file.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds == null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audio Files</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or description..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-52">
          <Select 
            value={languageFilter} 
            onValueChange={setLanguageFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">User</TableHead>
                  <TableHead className="hidden md:table-cell">Language</TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audioFiles.map(file => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{file.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {file.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {file.user_email || 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {file.language}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDuration(file.duration)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(file.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayPause(file.audio_url)}
                        >
                          {playingAudio === file.audio_url ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={file.audio_url} download={`${file.title}.mp3`}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteAudioId(file.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Audio File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this audio file? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteAudioId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteAudio}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {audioFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audio files found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {audioFiles.length > 0 ? (page - 1) * filesPerPage + 1 : 0}-
              {Math.min(page * filesPerPage, totalFiles)} of {totalFiles} files
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAudioFiles;
