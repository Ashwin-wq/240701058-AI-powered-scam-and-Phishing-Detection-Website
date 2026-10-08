import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Menu, X, Moon, Sun, History, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    // Check initial system preference or local storage
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <ShieldCheck className="h-6 w-6 text-primary" />
              PHISHSENSE
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/scan" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Scanner</Link>
            <Link to="/history" className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors">
              <History className="h-4 w-4" /> History
            </Link>
            <Link to="/insights" className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors">
              <Activity className="h-4 w-4" /> Model Insights
            </Link>
            
            {username ? (
              <Link to="/dashboard" className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
                <User className="h-4 w-4" /> {username}
              </Link>
            ) : (
              <Link to="/auth" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl font-bold transition-all">
                Login / Register
              </Link>
            )}

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/scan" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Scanner</Link>
            <Link to="/history" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2">
              <History className="h-4 w-4" /> History
            </Link>
            <Link to="/insights" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2">
              <Activity className="h-4 w-4" /> Model Insights
            </Link>
            
            {username ? (
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-primary hover:bg-muted flex items-center gap-2">
                <User className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-primary hover:bg-muted">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
