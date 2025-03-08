
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart, 
  Settings, 
  LogOut,
  Menu,
  CreditCard,
  X
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActiveRoute = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return path !== '/admin' && location.pathname.startsWith(path);
  };
  
  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="shadow-md hover:shadow-lg"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        fixed inset-y-0 left-0 z-40 w-64 bg-background border-r pt-5 px-3 flex-col justify-between
        flex md:relative h-full shadow-lg
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold">Audio Descriptions</h2>
            <p className="text-sm text-muted-foreground">Administration</p>
          </div>
          
          <div className="mt-8 space-y-1 flex-1 overflow-auto pb-4">
            <Link to="/admin" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/users" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/users") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </Link>
            <Link to="/admin/audio-files" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/audio-files") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <FileText className="mr-2 h-4 w-4" />
                Audio Files
              </Button>
            </Link>
            <Link to="/admin/purchases" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/purchases") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Purchases
              </Button>
            </Link>
            <Link to="/admin/ai-chat" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/ai-chat") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                AI Chat
              </Button>
            </Link>
            <Link to="/admin/analytics" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/analytics") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link to="/admin/feedback" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/feedback") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Feedback
              </Button>
            </Link>
            <Link to="/admin/settings" onClick={() => setMobileSidebarOpen(false)}>
              <Button 
                variant={isActiveRoute("/admin/settings") ? "secondary" : "ghost"} 
                className="w-full justify-start shadow-sm hover:shadow"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
          
          <div className="mt-auto mb-8 px-3">
            <Button
              variant="outline"
              className="w-full justify-start shadow-md hover:shadow-lg"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Overlay to close sidebar on mobile */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden w-full h-full md:ml-0">
        <main className="h-full overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
