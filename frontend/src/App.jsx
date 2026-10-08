import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ScannerPage from './pages/ScannerPage';
import ResultPage from './pages/ResultPage';
import QuizPage from './pages/QuizPage';
import ModelInsightsPage from './pages/ModelInsightsPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  useEffect(() => {
    // Forcefully add the dark class
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground dark:text-white flex flex-col font-sans transition-colors duration-500 relative">


        <Navbar />
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scan" element={<ScannerPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/insights" element={<ModelInsightsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
