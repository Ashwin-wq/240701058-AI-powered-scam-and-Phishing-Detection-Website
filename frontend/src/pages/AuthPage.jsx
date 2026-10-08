import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

// SVG icon for Google
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path fill="none" d="M1 1h22v22H1z" />
  </svg>
);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load Google Identity Services Script for the popup
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = () => {
    try {
      // We use a dummy client ID for the hackathon UI to trigger the popup
      // Note: In production, you MUST replace this with a real Client ID from Google Cloud Console.
      // Even with a dummy ID, Google's script will attempt to render the accounts popup (though it may fail network validation later).
      window.google.accounts.id.initialize({
        client_id: "1000000000000-dummyclientidforhackathon.apps.googleusercontent.com",
        callback: (response) => {
          // If login was successful (with real client ID)
          console.log("Encoded JWT ID token: " + response.credential);
          localStorage.setItem('username', 'Google_User');
          localStorage.setItem('token', 'dummy_google_token');
          navigate('/dashboard');
        }
      });
      
      // This forces the "Sign in with Google" account selection prompt to appear!
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback if OneTap is blocked by browser (like brave/safari)
          // Just simulate a login for the hackathon
          localStorage.setItem('username', 'Demo_Google_User');
          localStorage.setItem('token', 'demo_token');
          navigate('/dashboard');
        }
      });
    } catch (e) {
      // Fallback for hackathon demo if Google script didn't load
      localStorage.setItem('username', 'Google_Demo_User');
      localStorage.setItem('token', 'demo_token');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `http://localhost:8000${endpoint}`;
      
      let options = {
        method: 'POST',
      };

      if (isLogin) {
        // OAuth2 uses form data
        const params = new URLSearchParams();
        params.append('username', formData.username);
        params.append('password', formData.password);
        options.body = params;
        options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      } else {
        // Register uses JSON
        options.body = JSON.stringify(formData);
        options.headers = { 'Content-Type': 'application/json' };
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', formData.username);
        navigate('/dashboard');
      } else {
        // Switch to login after successful registration
        setIsLogin(true);
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-20 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-8 rounded-3xl shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="flex justify-center mb-6">
          <ShieldCheck className="w-12 h-12 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          {isLogin ? 'Enter your credentials to access your dashboard.' : 'Join PHISHSENSE to start tracking your awareness score.'}
        </p>

        {error && (
          <div className={`p-3 rounded-lg mb-6 text-sm ${error.includes('successful') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                type="text" 
                required
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="hunter2"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input 
                  type="email" 
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                type="password" 
                required
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all disabled:opacity-70 flex justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              isLogin ? 'Sign In' : 'Register'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b border-border w-1/5 lg:w-1/4"></span>
          <a href="#" className="text-xs text-center text-muted-foreground uppercase">or continue with</a>
          <span className="border-b border-border w-1/5 lg:w-1/4"></span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button" 
          className="mt-6 w-full flex items-center justify-center py-3 px-4 bg-card border border-border text-foreground font-medium rounded-xl shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline focus:outline-none"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
