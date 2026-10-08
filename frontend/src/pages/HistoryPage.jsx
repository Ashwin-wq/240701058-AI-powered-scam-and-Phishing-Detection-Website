import { useState, useEffect } from 'react';
import { History, AlertTriangle, ShieldCheck, Clock, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/history');
        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/history/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete from backend.");
      }
    } catch (error) {
      console.error("Failed to delete history item:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <History className="w-8 h-8 text-primary" /> Scan History (Crowd Memory)
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Recent threats identified and safely logged by the PHISHSENSE community.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Loading database history...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg">No malicious scans recorded yet!</p>
            <p className="text-sm mt-2">When a high-risk URL is scanned, it will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Date / Time</th>
                  <th className="px-6 py-4 font-medium">Domain</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Risk Level</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{item.domain}</td>
                    <td className="px-6 py-4 text-sm">{item.threat_category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max ${
                        item.risk_level === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        item.risk_level === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        {item.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
