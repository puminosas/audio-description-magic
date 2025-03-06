
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-full">
        {/* Mobile menu button */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Sidebar - hidden on mobile unless toggled */}
        <Sidebar className={`
          ${mobileSidebarOpen ? 'block' : 'hidden'} 
          md:flex w-64 border-r pt-5 px-3 flex-col justify-between
          z-40 bg-background h-full fixed md:static
        `}>
          <div>
            <div className="px-3 py-2">
              <h2 className="mb-2 text-lg font-semibold">Audio Descriptions</h2>
              <p className="text-sm text-muted-foreground">Administration</p>
            </div>
            
            <div className="mt-8 space-y-1.5">
              <Link to="/admin" onClick={() => setMobileSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin/users" onClick={() => setMobileSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
              </Link>
              <Link to="/admin/audio-files" onClick={() => setMobileSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Audio Files
                </Button>
              </Link>
              <Link to="/admin/ai-chat" onClick={() => setMobileSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  AI Chat
                </Button>
              </Link>
              <Link to="/admin/analytics" onClick={() => setMobileSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link to="/admin/feedback" onClick={() => setMobileSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedback
                </Button>
              </Link>
              <Link to="/admin/settings" onClick={() => setMobileSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mb-8 px-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </Sidebar>
        
        {/* Overlay to close sidebar on mobile */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 md:hidden" 
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-auto md:ml-0 pt-16 md:pt-0">
          <main className="py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
