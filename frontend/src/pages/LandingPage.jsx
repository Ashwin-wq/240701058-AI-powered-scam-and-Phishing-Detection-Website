import { Link } from 'react-router-dom';
import { ShieldAlert, BookOpen, Fingerprint, LockKeyhole, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center pt-20 pb-24 px-4 max-w-7xl mx-auto relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl p-8 md:p-14 rounded-[3rem] backdrop-blur-2xl bg-background/60 dark:bg-background/40 shadow-2xl shadow-black/5 dark:shadow-primary/5 border border-white/50 dark:border-white/10 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Understand suspicious links <br className="hidden md:block"/> 
          <span className="text-primary">before they become a threat.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          PHISHSENSE combines machine-learning detection, threat intelligence, explainable evidence, and personalized security awareness training.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/scan" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            Scan a URL or Message <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/quiz" className="bg-muted text-foreground px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
            Start Awareness Training <BookOpen className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-32 grid md:grid-cols-3 gap-8 w-full"
      >
        <FeatureCard 
          icon={<Fingerprint className="w-8 h-8 text-primary" />}
          title="ML Detection"
          desc="Analyzes structural URL features instantly using Random Forest and XGBoost models."
        />
        <FeatureCard 
          icon={<ShieldAlert className="w-8 h-8 text-primary" />}
          title="Explainable AI"
          desc="Translates complex technical evidence into simple, plain-language insights."
        />
        <FeatureCard 
          icon={<LockKeyhole className="w-8 h-8 text-primary" />}
          title="Awareness Training"
          desc="Generates personalized quizzes from the exact threats detected in your scans."
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-3xl glass-card hover:scale-[1.02] transition-transform duration-300">
      <div className="p-4 bg-primary/10 w-fit rounded-2xl mb-5 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
