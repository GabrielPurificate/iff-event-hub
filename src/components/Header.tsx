import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Calendar, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">IFF Eventos</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Eventos
            </Link>
            {user.role === 'organizer' && (
              <Link 
                to="/create-event" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/create-event' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Criar Evento
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user.role === 'organizer' && (
            <Button asChild size="sm" className="hidden md:flex shadow-button">
              <Link to="/create-event">
                <Plus className="w-4 h-4 mr-2" />
                Novo Evento
              </Link>
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;