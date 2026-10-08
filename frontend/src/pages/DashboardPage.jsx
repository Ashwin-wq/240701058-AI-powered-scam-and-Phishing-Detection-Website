import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, Shield, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const username = localStorage.getItem('username');
      if (!username) {
        navigate('/auth');
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/awareness/profile/${username}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          localStorage.removeItem('username');
          localStorage.removeItem('token');
          navigate('/auth');
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-primary" /> Dashboard
          </h2>
          <p className="text-muted-foreground text-lg mt-2">
            Welcome back, <span className="text-foreground font-semibold">{localStorage.getItem('username')}</span>!
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            navigate('/');
          }}
          className="px-4 py-2 bg-card border border-border rounded-xl text-foreground font-medium shadow-sm hover:bg-muted transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4"
        >
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Experience Points</p>
            <h3 className="text-3xl font-black">{profile?.xp || 0} <span className="text-lg font-bold text-primary">XP</span></h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4"
        >
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Scans Completed</p>
            <h3 className="text-3xl font-black">{profile?.scans_completed || 0}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4"
        >
          <div className="p-4 bg-green-500/10 rounded-2xl">
            <Trophy className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Quiz Accuracy</p>
            <h3 className="text-3xl font-black">{profile?.quiz_score || 0}%</h3>
          </div>
        </motion.div>
      </div>

      <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Award className="w-6 h-6 text-primary" /> Your Badges
        </h3>
        
        {profile?.badges && profile.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.badges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-6 border border-border rounded-2xl bg-muted/30 text-center hover:bg-muted/50 transition-colors">
                <span className="text-4xl mb-3">{badge.icon}</span>
                <span className="font-bold text-sm">{badge.name}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(badge.awarded_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No badges earned yet</p>
            <p className="text-sm">Complete quizzes and identify threats to earn achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}
