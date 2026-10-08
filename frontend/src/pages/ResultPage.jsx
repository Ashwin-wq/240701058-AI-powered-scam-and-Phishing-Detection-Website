import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, Copy, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/utils';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [showTech, setShowTech] = useState(false);

  if (!result) {
    return (
      <div className="text-center pt-20">
        <p>No result found. Please scan a URL first.</p>
        <button onClick={() => navigate('/scan')} className="mt-4 text-primary">Go to Scanner</button>
      </div>
    );
  }

  const { risk_level, risk_score, url, explanation, evidence, threat_intelligence, model, awareness } = result;

  const levelConfig = {
    SAFE: { color: 'bg-safe', text: 'text-safe', icon: ShieldCheck, title: 'SAFE' },
    LOW: { color: 'bg-low', text: 'text-low', icon: Info, title: 'LOW RISK' },
    SUSPICIOUS: { color: 'bg-suspicious', text: 'text-suspicious', icon: AlertTriangle, title: 'SUSPICIOUS' },
    HIGH: { color: 'bg-high', text: 'text-high', icon: ShieldAlert, title: 'HIGH RISK' }
  };

  const config = levelConfig[risk_level] || levelConfig.SAFE;
  const Icon = config.icon;

  const getScoreColor = (score) => {
    if (score <= 20) return 'bg-green-400';
    if (score <= 40) return 'bg-yellow-400';
    if (score <= 60) return 'bg-orange-500';
    if (score <= 80) return 'bg-red-400';
    return 'bg-red-700';
  };
  const scoreColor = getScoreColor(risk_score);

  const copyReport = () => {
    const report = `PHISHSENSE SCAN REPORT\nURL: ${url}\nRisk Level: ${risk_level}\nRisk Score: ${risk_score}/100\nExplanation: ${explanation?.plain_explanation || 'N/A'}`;
    navigator.clipboard.writeText(report);
    alert('Report copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
      {/* Header Card */}
      <div className="bg-card border border-border rounded-3xl p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={cn("w-32 h-32 rounded-full flex items-center justify-center text-white mb-2 shadow-lg", scoreColor)}>
            <Icon className="w-16 h-16" />
          </div>
          <div className="text-3xl font-black">{risk_score}<span className="text-muted-foreground text-lg font-normal">/100</span></div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className={cn("inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider bg-opacity-10", config.text, config.color.replace('bg-', 'bg-') + '/10')}>
            {config.title}
          </div>
          <h2 className="text-2xl font-bold mb-4 break-all">{url}</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            {explanation?.plain_explanation || (risk_level === 'SAFE' ? 'No significant malicious signals were detected.' : 'Several signals suggest this URL may be unsafe.')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button onClick={copyReport} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors">
              <Copy className="w-4 h-4" /> Copy Report
            </button>
            {awareness && awareness.quiz && (
              <button onClick={() => navigate('/quiz', { state: { awareness } })} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg font-medium shadow-sm transition-opacity">
                Start Awareness Quiz <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Risk Score Guide */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-white">Risk Score Guide</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">User Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className={cn("transition-colors", risk_score >= 0 && risk_score <= 20 ? "bg-green-400/10" : "hover:bg-muted/50")}>
                <td className="px-6 py-4 font-mono font-bold text-green-400">0–20%</td>
                <td className="px-6 py-4 font-semibold text-green-400">Very Low Risk</td>
                <td className="px-6 py-4 text-slate-300">Site appears safe to access</td>
              </tr>
              <tr className={cn("transition-colors", risk_score >= 21 && risk_score <= 40 ? "bg-yellow-400/10" : "hover:bg-muted/50")}>
                <td className="px-6 py-4 font-mono font-bold text-yellow-400">21–40%</td>
                <td className="px-6 py-4 font-semibold text-yellow-400">Low Risk</td>
                <td className="px-6 py-4 text-slate-300">No major threats detected</td>
              </tr>
              <tr className={cn("transition-colors", risk_score >= 41 && risk_score <= 60 ? "bg-orange-500/10" : "hover:bg-muted/50")}>
                <td className="px-6 py-4 font-mono font-bold text-orange-500">41–60%</td>
                <td className="px-6 py-4 font-semibold text-orange-500">Moderate Risk</td>
                <td className="px-6 py-4 text-slate-300">Proceed with caution</td>
              </tr>
              <tr className={cn("transition-colors", risk_score >= 61 && risk_score <= 80 ? "bg-red-400/10" : "hover:bg-muted/50")}>
                <td className="px-6 py-4 font-mono font-bold text-red-400">61–80%</td>
                <td className="px-6 py-4 font-semibold text-red-400">High Risk</td>
                <td className="px-6 py-4 text-slate-300">Potentially malicious — avoid sensitive actions</td>
              </tr>
              <tr className={cn("transition-colors", risk_score >= 81 && risk_score <= 100 ? "bg-red-700/20" : "hover:bg-muted/50")}>
                <td className="px-6 py-4 font-mono font-bold text-red-600">81–100%</td>
                <td className="px-6 py-4 font-semibold text-red-600">Critical Risk</td>
                <td className="px-6 py-4 text-slate-300">Dangerous site — do not access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Why Section */}
      {evidence && evidence.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Why?</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {evidence.map((ev, i) => (
              <div key={i} className="bg-card border border-border p-4 rounded-xl flex gap-3 items-start">
                <AlertTriangle className={cn("w-5 h-5 mt-0.5", ev.impact === 'High' ? 'text-destructive' : 'text-suspicious')} />
                <div>
                  <h4 className="font-bold">{ev.feature}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Intel */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Threat Intelligence</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {threat_intelligence?.found ? 'Match found in threat database.' : 'No known threat records found.'}
          </p>
        </div>
        {threat_intelligence?.is_simulated && (
          <span className="text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground">SIMULATED</span>
        )}
      </div>

      {/* Technical Details Toggle */}
      <button 
        onClick={() => setShowTech(!showTech)} 
        className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors font-medium mb-4"
      >
        Show Technical Analysis
        {showTech ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showTech && (
        <div className="p-6 bg-card border border-border rounded-xl space-y-4 text-sm animate-in fade-in slide-in-from-top-4">
          <div>
            <span className="font-bold">Primary Model:</span> {model?.primary}
          </div>
          <div>
            <span className="font-bold">ML Probability (Phishing):</span> {(model?.probability * 100).toFixed(2)}%
          </div>
          {explanation?.technical_explanation && (
            <div>
              <span className="font-bold">AI Technical Analysis:</span>
              <p className="text-muted-foreground mt-1">{explanation.technical_explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
