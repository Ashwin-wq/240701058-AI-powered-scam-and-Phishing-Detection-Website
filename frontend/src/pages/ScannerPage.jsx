import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Network, Type, Lock, X, Link as LinkIcon, FileText, MessageSquare, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScannerPage() {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [inputType, setInputType] = useState('url');
  const [loading, setLoading] = useState(false);
  const [pipelineState, setPipelineState] = useState('');
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (e, scanUrl = url) => {
    if (e) e.preventDefault();
    if (inputType === 'url' && !scanUrl.trim()) return;
    if (inputType === 'message' && !message.trim()) return;
    if (inputType === 'file' && !file) return;

    const isLoggedin = !!localStorage.getItem('username');
    const freeScansUsed = parseInt(localStorage.getItem('freeScansUsed') || '0', 10);
    
    if (!isLoggedin && freeScansUsed >= 1) {
      setShowLoginPopup(true);
      return;
    }

    setLoading(true);
    setError(null);
    setPipelineState('Initializing secure connection...');

    const clientId = Math.random().toString(36).substring(7);
    
    let ws;
    try {
      ws = new WebSocket(`ws://localhost:8000/scan-status/${clientId}`);
      ws.onmessage = (event) => {
        setPipelineState(event.data);
      };
    } catch (err) {
      console.warn("Could not connect to WebSocket, continuing anyway", err);
    }

    try {
      const endpoint = inputType === 'url' ? `/scan/url?client_id=${clientId}` : 
                       inputType === 'message' ? '/scan/message' : '/scan/file';
                       
      let options = { method: 'POST' };
      
      if (inputType === 'url' || inputType === 'message') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(inputType === 'url' ? { url: scanUrl } : { content: message });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        options.body = formData;
      }

      const response = await fetch(`http://localhost:8000${endpoint}`, options);

      if (!response.ok) throw new Error('Cannot reach the backend. Is uvicorn running on port 8000?');
      const data = await response.json();
      
      if (!isLoggedin) {
        localStorage.setItem('freeScansUsed', '1');
      }
      
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      navigate('/result', { state: { result: data } });

    } catch (err) {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      setError('Cannot reach the backend. Is uvicorn running on port 8000?');
      setLoading(false);
    }
  };

  const demoExamples = {
    url: [
      { label: "Safe URL", data: "https://www.google.com", icon: ShieldCheck },
      { label: "IP address scam", data: "http://192.168.1.1/login.php", icon: Network },
      { label: "Typosquatting", data: "https://secure-login-update-paypal-account.com", icon: Type }
    ],
    message: [
      { label: "Urgent SMS", data: "URGENT: Your account will be locked. Verify your password now at this link: http://bad-link.com", icon: Type },
      { label: "Fake Invoice", data: "Attached is the invoice for $4,500. Please pay immediately or we will sue.", icon: Type },
      { label: "Safe Message", data: "Hey mom, I'll be home around 6 PM for dinner!", icon: ShieldCheck }
    ],
    file: [
      { label: "Fake PayPal Receipt", data: "paypal-receipt-fake.pdf", icon: Type },
      { label: "Tax Scam Document", data: "urgent-tax-form.png", icon: Type }
    ]
  };

  const handleDemoClick = (data) => {
    if (inputType === 'url') {
      setUrl(data);
      handleScan(null, data);
    } else if (inputType === 'message') {
      setMessage(data);
    } else if (inputType === 'file') {
      const mockFile = new File(["mock content for demo"], data, { type: data.endsWith(".pdf") ? "application/pdf" : "image/png" });
      setFile(mockFile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-12 relative z-10 font-sans">
      <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Scan a link, message, or file</h2>
      <p className="text-[15px] text-muted-foreground mb-8">Analyze any content in an isolated environment.</p>

      <div className="flex gap-2 mb-6 p-1 bg-[#13151A] border border-[#272B36] rounded-xl w-max">
        <button 
          type="button"
          onClick={() => setInputType('url')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${inputType === 'url' ? 'bg-[#272B36] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          <LinkIcon className="w-4 h-4" /> URL Link
        </button>
        <button 
          type="button"
          onClick={() => setInputType('message')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${inputType === 'message' ? 'bg-[#272B36] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4" /> Message/Email
        </button>
        <button 
          type="button"
          onClick={() => setInputType('file')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${inputType === 'file' ? 'bg-[#272B36] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          <FileText className="w-4 h-4" /> Document/Image
        </button>
      </div>

      <form onSubmit={(e) => handleScan(e, url)} className="flex flex-col sm:flex-row gap-3 mb-6 items-start">
        <AnimatePresence mode="wait">
          {inputType === 'url' && (
            <motion.div key="url" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="relative flex-1 w-full">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com"
                className="w-full px-4 py-3 bg-[#13151A] border border-[#272B36] rounded-xl focus:border-primary focus:outline-none transition-colors text-white placeholder-slate-500 font-mono text-sm"
                disabled={loading}
              />
            </motion.div>
          )}

          {inputType === 'message' && (
            <motion.div key="message" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="relative flex-1 w-full">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste the suspicious SMS, WhatsApp message, or Email body here..."
                className="w-full px-4 py-3 bg-[#13151A] border border-[#272B36] rounded-xl focus:border-primary focus:outline-none transition-colors text-white placeholder-slate-500 font-mono text-sm min-h-[120px] resize-y"
                disabled={loading}
              />
            </motion.div>
          )}

          {inputType === 'file' && (
            <motion.div key="file" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="relative flex-1 w-full">
              <label className="flex flex-col items-center justify-center w-full h-[120px] border border-[#272B36] border-dashed rounded-xl cursor-pointer bg-[#13151A] hover:bg-[#1A1D24] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">
                    {file ? <span className="font-semibold text-primary">{file.name}</span> : <span>Click to upload PDF or Image</span>}
                  </p>
                </div>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} disabled={loading} accept=".pdf,image/*" />
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          disabled={loading || (inputType === 'url' && !url.trim()) || (inputType === 'message' && !message.trim()) || (inputType === 'file' && !file)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 h-fit w-full sm:w-auto"
        >
          <Search className="w-4 h-4" />
          Scan
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm text-muted-foreground">Demo mode:</span>
        {demoExamples[inputType]?.map((ex, i) => {
          const Icon = ex.icon;
          return (
            <button 
              key={i} 
              type="button" 
              onClick={() => handleDemoClick(ex.data)} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#272B36] text-sm text-slate-300 hover:bg-[#1A1D24] transition-colors"
            >
              <Icon className="w-4 h-4 text-blue-400" />
              {ex.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
            <div className="bg-[#2D1216] border border-[#521C22] text-[#F87171] px-4 py-3 rounded-xl text-sm font-medium shadow-sm">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(loading || pipelineState) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0F1117] border border-[#1E2330] rounded-xl overflow-hidden shadow-2xl mt-4">
          <div className="bg-[#151822] border-b border-[#1E2330] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="w-3 h-3 rounded-full bg-[#EAB308]" />
              <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Agent activity</span>
          </div>
          <div className="p-6 font-mono text-sm text-slate-300 min-h-[200px]">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&gt;</span>
              <span className="animate-pulse">{pipelineState || 'Detection Agent: extracting features...'}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Login Required Popup */}
      <AnimatePresence>
        {showLoginPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#11131A] border border-[#272B36] p-8 rounded-2xl shadow-2xl max-w-md w-full relative"
            >
              <button 
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-[#1A1D24] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <Lock className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2 text-white">Login Required</h3>
              <p className="text-center text-slate-400 mb-6 text-sm">
                You've used your free guest scan! Please log in or create an account to unlock unlimited scans.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm"
                >
                  Login / Register
                </button>
                <button 
                  onClick={() => setShowLoginPopup(false)}
                  className="w-full py-2.5 px-4 border border-[#272B36] text-slate-300 font-medium rounded-xl hover:bg-[#1A1D24] transition-colors text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
