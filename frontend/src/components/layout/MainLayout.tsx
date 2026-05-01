import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Library, Users, LogOut, Moon, Sun, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../theme-provider';

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Books Catalog', path: '/books', icon: BookOpen },
    { name: 'My Lendings', path: '/lendings', icon: Library },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  if (user?.permissions?.includes('ADMIN')) {
    navItems.push({ name: 'Manage Books', path: '/admin/books', icon: BookOpen });
    navItems.push({ name: 'Manage Users', path: '/admin/users', icon: Users });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r bg-card flex">
        <div className="h-16 flex items-center px-6 border-b">
          <BookOpen className="w-6 h-6 mr-2 text-primary" />
          <span className="font-bold text-lg tracking-tight">CTSE Library</span>
        </div>
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="grid gap-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-sm overflow-hidden pr-2">
              <p className="font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-lg font-semibold">{navItems.find(item => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))?.name || 'Dashboard'}</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-muted/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
