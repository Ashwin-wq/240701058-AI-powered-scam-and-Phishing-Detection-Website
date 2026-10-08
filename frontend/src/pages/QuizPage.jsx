import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Award } from 'lucide-react';
import { cn } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';

const defaultAwareness = {
  what_to_remember: "Always verify the sender's identity before clicking links or downloading attachments. Phishing attacks rely on urgency and fear.",
  how_to_spot_next_time: "Check the actual URL carefully (look out for hyphens or extra letters). Hover over links before clicking. Never provide passwords via email.",
  quiz: [
    {
      question: "Which of the following is a major red flag in an email or text message?",
      options: [
        "The message addresses you by your first name.",
        "The message creates a sense of extreme urgency or threatens account suspension.",
        "The message contains a standard company signature.",
        "The message is sent during normal business hours."
      ],
      correct_answer: "The message creates a sense of extreme urgency or threatens account suspension.",
      explanation: "Scammers use artificial urgency to force you into making quick, emotional decisions before you have time to analyze the situation rationally."
    },
    {
      question: "You receive an email from 'IT Helpdesk' asking you to reply with your password to keep your account active. What should you do?",
      options: [
        "Reply with your password immediately to avoid suspension.",
        "Click the link provided to reset your password.",
        "Ignore the email and report it as a phishing attempt.",
        "Forward the email to all your coworkers to warn them."
      ],
      correct_answer: "Ignore the email and report it as a phishing attempt.",
      explanation: "Legitimate IT departments, banks, or services will NEVER ask for your password via email. This is a classic credential harvesting scam."
    },
    {
      question: "What is 'Typosquatting' in the context of URLs?",
      options: [
        "Sending too many emails in a short amount of time.",
        "Using a fake domain name that is spelled very similarly to a real one (e.g., netflix-login.com).",
        "A virus that slows down your keyboard typing speed.",
        "Using ALL CAPS in an email subject line."
      ],
      correct_answer: "Using a fake domain name that is spelled very similarly to a real one (e.g., netflix-login.com).",
      explanation: "Typosquatting relies on victims not looking closely at the URL bar and trusting a domain that looks visually similar to a brand they know."
    }
  ]
};

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const awareness = location.state?.awareness || defaultAwareness;
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  const quiz = awareness.quiz;
  const currentQ = quiz[currentIdx];

  const handleSelect = (opt) => {
    if (isAnswered) return;
    setSelected(opt);
    setIsAnswered(true);
    if (opt === currentQ.correct_answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      setShowFinal(true);
    }
  };

  if (showFinal) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-12 text-center">
        <Award className="w-20 h-20 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Training Complete!</h2>
        <p className="text-xl mb-8">You scored {score} out of {quiz.length}</p>
        
        <div className="bg-card border border-border p-6 rounded-2xl text-left mb-8 space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-lg mb-2">What you should remember</h3>
            <p className="text-muted-foreground">{awareness.what_to_remember}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">How to spot this next time</h3>
            <p className="text-muted-foreground">{awareness.how_to_spot_next_time}</p>
          </div>
        </div>

        <button onClick={() => navigate('/scan')} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold">
          Scan Another Link
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-10">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Awareness Training</h2>
        <span className="text-muted-foreground font-medium">Question {currentIdx + 1} of {quiz.length}</span>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        <h3 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect = opt === currentQ.correct_answer;
            
            let btnClass = "w-full text-left p-4 rounded-xl border transition-all ";
            
            if (!isAnswered) {
              btnClass += "border-border hover:border-primary hover:bg-primary/5 bg-background";
            } else {
              if (isCorrect) btnClass += "border-safe bg-safe/10 text-safe-foreground";
              else if (isSelected) btnClass += "border-destructive bg-destructive/10 text-destructive-foreground";
              else btnClass += "border-border opacity-50 bg-background";
            }

            return (
              <button 
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelect(opt)}
                className={btnClass}
              >
                <div className="flex justify-between items-center">
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-safe" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-muted p-5 rounded-xl border border-border"
            >
              <h4 className="font-bold mb-1">Explanation</h4>
              <p className="text-muted-foreground mb-4">{currentQ.explanation}</p>
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium ml-auto"
              >
                {currentIdx < quiz.length - 1 ? 'Next Question' : 'Finish'} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
