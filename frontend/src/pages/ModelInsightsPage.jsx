import { Activity, Database, BrainCircuit, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModelInsightsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-primary" /> Model Insights
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Behind the scenes of the PHISHSENSE detection engine.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Dataset</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The models were trained on the <span className="font-semibold text-foreground">UCI Phishing Websites Dataset</span>.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Total Samples</span>
              <span className="font-mono font-medium">11,055</span>
            </li>
            <li className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Unique Samples (Used)</span>
              <span className="font-mono font-medium">5,849</span>
            </li>
            <li className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Features per URL</span>
              <span className="font-mono font-medium">30</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Performance</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The primary detection engine uses an <span className="font-semibold text-foreground">XGBoost Classifier</span>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-xl text-center">
              <div className="text-2xl font-black text-primary">99.31%</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">ROC-AUC</div>
            </div>
            <div className="p-4 bg-muted rounded-xl text-center">
              <div className="text-2xl font-black text-primary">96.33%</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Architecture Constraints</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          In this implementation, the ML models make the primary detection decision based on structural features. 
          The Large Language Model (Gemini) is <strong>strictly prohibited</strong> from classifying URLs itself. It is only used to translate the mathematical evidence into plain language explanations and to generate personalized awareness training.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Some advanced features (like PageRank and Web Traffic) are defaulted to neutral values because they require heavy external web scraping, which was out of scope for the demo. However, the pipeline natively supports them when production APIs are connected.
        </p>
      </div>
    </div>
  );
}
