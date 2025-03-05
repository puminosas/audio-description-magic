
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { HistoryIcon, PlusIcon, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { ChatSession } from './types';
import { formatDistanceToNow } from 'date-fns';

interface ChatSessionsListProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  onCreateNewSession: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession?: (sessionId: string, newTitle: string) => void;
}

const ChatSessionsList: React.FC<ChatSessionsListProps> = ({
  sessions,
  currentSessionId,
  isLoading,
  onCreateNewSession,
  onLoadSession,
  onDeleteSession,
  onRenameSession
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-medium">Chat History</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={onCreateNewSession}
        >
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] rounded-md">
        {sessions.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <HistoryIcon className="mb-2 h-10 w-10 opacity-20" />
            <p>No saved chat sessions</p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-2"
              onClick={onCreateNewSession}
            >
              Start a new chat
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex cursor-pointer items-center justify-between rounded-md p-2 text-sm hover:bg-accent ${
                  currentSessionId === session.id ? 'bg-accent' : ''
                }`}
                onClick={() => onLoadSession(session.id)}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">{session.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onLoadSession(session.id);
                    }}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatSessionsList;
