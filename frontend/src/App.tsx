import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/Navbar';
import { EmailTable } from './components/EmailTable';
import { ComposeModal } from './components/ComposeModal';
import { useState, useEffect } from 'react';
import api from './services/api';
import { Plus, BarChart3, Send, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { CardBody, CardContainer, CardItem } from './components/ui/3d-card';
import { useAuth } from './hooks/useAuth';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [emails, setEmails] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, sent: 0, failed: 0 });

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const endpoint = activeTab === 'scheduled'
        ? '/api/campaigns/emails/scheduled'
        : '/api/campaigns/emails/sent';
      const res = await api.get(endpoint);
      setEmails(res.data.emails);

      setEmails(res.data.emails);

      // Fetch stats from backend
      const statsRes = await api.get('/api/campaigns/stats');
      const backendStats = statsRes.data.stats;

      setStats({
        total: backendStats.total,
        pending: backendStats.scheduled + backendStats.queued,
        sent: backendStats.sent,
        failed: backendStats.failed
      });

    } catch (error) {
      console.error('Failed to fetch emails', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    // Check if we are in demo mode
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo && !user) {
      // Mock user for demo mode
      // We manually set the user in the auth context? 
      // Since useAuth is a hook, we might need to update the hook instead.
      // However, for simplicity in this file, we can just bypass the check if we modify useAuth.
      // Let's actually look at useAuth first.
    }

    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  // FIXME: The useAuth hook controls the user state. We should actually update useAuth.ts
  // But for a quick fix in App.tsx to bypass login:
  const isDemo = localStorage.getItem('demo_mode') === 'true';

  if (loading && !isDemo) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!user && !isDemo) return <Navigate to="/login" replace />;

  // If in demo mode and no user, we render with mock data
  const currentUser = user || (isDemo ? { name: 'Demo User', email: 'demo@example.com', id: 999 } : null);

  const statCards = [
    { label: 'Total Emails', value: stats.total, icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Sent Successfully', value: stats.sent, icon: Send, color: 'bg-green-500' },
    { label: 'Failed', value: stats.failed, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex font-sans antialiased">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-20 lg:ml-64 p-8 overflow-y-auto bg-gray-50 dark:bg-black dark:text-white">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Welcome back, {currentUser?.name}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors z-50 relative"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Campaign</span>
          </motion.button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat) => (
            <CardContainer key={stat.label} containerClassName="py-0" className="w-full">
              <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-indigo-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border transition-all duration-200 ease-linear">
                <div className="flex justify-between items-start">
                  <div>
                    <CardItem
                      translateZ="50"
                      className="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {stat.label}
                    </CardItem>
                    <CardItem
                      translateZ="60"
                      className="text-3xl font-bold text-gray-900 dark:text-white mt-3"
                    >
                      {stat.value}
                    </CardItem>
                  </div>
                  <CardItem translateZ="40">
                    <div className={`p-4 rounded-xl ${stat.color} bg-opacity-20 text-${stat.color.split('-')[1]}-600 dark:text-${stat.color.split('-')[1]}-400`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>

        {/* Content Area - Wrapped in 3D Card for consistency */}
        <motion.div
          className="w-full h-full"
          initial={{ y: 0 }}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="bg-white relative group dark:hover:shadow-2xl dark:hover:shadow-indigo-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-0 border transition-all duration-200 ease-linear overflow-hidden">

            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 transform transition-transform duration-200 group-hover:translate-x-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {activeTab === 'scheduled' ? <Clock className="w-6 h-6 text-indigo-500" /> : <Send className="w-6 h-6 text-green-500" />}
                  {activeTab === 'scheduled' ? 'Scheduled Campaigns' : 'Sent History'}
                </h3>
              </div>
              <div className="transform transition-transform duration-200 group-hover:translate-x-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 font-medium">
                  {emails.length} items
                </span>
              </div>
            </div>

            <div className="p-0">
              <EmailTable
                emails={emails}
                type={activeTab}
                loading={dataLoading}
              />
            </div>

          </div>
        </motion.div>

        <ComposeModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSuccess={() => {
            if (activeTab === 'scheduled') fetchData();
            setIsComposeOpen(false);
          }}
        />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
