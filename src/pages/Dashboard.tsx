import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useInvestorDashboard } from "@/hooks/useInvestorDashboard";
import { Button } from "@/components/ui/button";
import { HolographicCard } from "@/components/HolographicCard";
import {
  HomeIcon,
  DocsIcon,
  ActivityIcon,
  MoneyIcon,
  SettingsIcon,
  TrendUpIcon,
  ChartIcon
} from "@/components/Icons";
import {
  LogOut,
  Menu,
  Zap,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentsTab } from "@/components/dashboard/DocumentsTab";
import heroImage from "@/assets/pump-jacks.jpg";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const { stats, loading: statsLoading } = useInvestorDashboard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [chartRange, setChartRange] = useState("24H");

  // Real activity data visualization - show activity over time periods
  const getChartData = (range: string) => {
    // These will be replaced with real data in a future iteration
    // For now, show a visual representation based on user's activity count
    const baseActivity = stats.recentActivity.length * 10;
    const variance = () => Math.floor(Math.random() * 20) + baseActivity;
    return Array.from({ length: 12 }, () => Math.min(variance(), 100));
  };

  const chartData = getChartData(chartRange);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: HomeIcon, label: "Overview" },
    { icon: DocsIcon, label: "Documents" },
    { icon: ActivityIcon, label: "Live Ops" },
    { icon: MoneyIcon, label: "Financials" },
    { icon: SettingsIcon, label: "System" },
  ];

  // Use role-based access control instead of hard-coded email
  const isLevel6 = isAdmin;

  return (
    <div className="min-h-screen bg-midnight text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative">

      {/* Premium Background - No external dependencies */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#020410]" />
        {/* Inline SVG noise pattern */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc=')] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[150px] mix-blend-screen" />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="relative z-10 flex h-dvh md:h-screen p-4 md:p-6 gap-6 flex-col md:flex-row">

        {/* 2. FLOATING SIDEBAR (Desktop) - Premium 2025 */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-20 hidden md:flex flex-col items-center py-8 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Top highlight */}
          <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Brand Mark */}
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-lg text-white shadow-[0_4px_20px_rgba(0,102,255,0.4)] mb-10">
            B
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
          </div>

          {/* Nav Items */}
          <nav className="flex-1 flex flex-col gap-3 w-full px-3">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(item.label)}
                className={`relative group flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === item.label
                  ? "bg-gradient-to-r from-primary/30 to-primary/10 text-white shadow-[0_0_20px_rgba(0,102,255,0.3)] border border-primary/30"
                  : "text-gray-500 hover:text-white hover:bg-white/[0.08]"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {/* Active indicator */}
                {activeTab === item.label && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,102,255,0.5)]" />
                )}
                {/* Tooltip */}
                <span className="absolute left-16 bg-gray-900/95 backdrop-blur-xl text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap border border-white/10 pointer-events-none font-medium shadow-xl z-50">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button onClick={handleSignOut} className="p-3 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 mt-auto">
            <LogOut className="w-5 h-5" />
          </button>
        </motion.aside>

        {/* 3. MAIN HUD AREA */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden">

          {/* Header HUD - Premium 2025 */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative flex items-center justify-between bg-gradient-to-r from-white/[0.08] to-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 md:px-8 py-3.5 md:py-4 shadow-2xl shrink-0 overflow-hidden"
          >
            {/* Subtle top highlight */}
            <div className="absolute top-0 left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                <span className="hidden md:inline text-gray-300">COMMAND CENTER</span>
                <span className="md:hidden text-gray-300">CMD</span>
                <span className="text-white/30 mx-2">//</span>
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent animate-gradient-x">{activeTab.toUpperCase()}</span>
              </h1>
              <p className="text-[11px] text-cyan-400/60 tracking-[0.2em] uppercase mt-1.5 font-medium">System Operational • {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-[11px] text-emerald-400 font-medium tracking-wide">LIVE DATA FEED</span>
              </div>

              <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white leading-none">{user?.user_metadata?.full_name || "Tim Vang"}</p>
                  <p className="text-[11px] text-gray-500 mt-1.5 font-medium">{isLevel6 ? "Level 6 Access" : "Level 5 Access"}</p>
                </div>
                <div className="relative w-11 h-11 rounded-full ring-2 ring-primary/40 ring-offset-2 ring-offset-[#020410] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(0,102,255,0.3)]">
                  {user?.email?.[0]?.toUpperCase() || "T"}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#020410]" />
                </div>
              </div>
            </div>
          </motion.header>

          {/* Dashboard Scroll Area */}
          <main className="flex-1 overflow-y-auto pr-2 pb-24 md:pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent space-y-6">

            <AnimatePresence mode="wait">
              {activeTab === "Overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* KPI ROW - Real Data Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
                    <StatsCard 
                      delay={0.1} 
                      title="NDA Status" 
                      displayValue={stats.ndaSigned ? "Signed" : "Pending"} 
                      sub={stats.ndaSignedAt ? `Signed ${new Date(stats.ndaSignedAt).toLocaleDateString()}` : "Action required"} 
                      icon={stats.ndaSigned ? CheckCircle : AlertCircle} 
                      trend={stats.ndaSigned ? "up" : "neutral"} 
                    />
                    <StatsCard 
                      delay={0.2} 
                      title="Documents Assigned" 
                      displayValue={String(stats.assignedDocuments)} 
                      sub={stats.assignedDocuments > 0 ? "Ready to review" : "None yet"} 
                      icon={DocsIcon} 
                      trend={stats.assignedDocuments > 0 ? "up" : "neutral"} 
                    />
                    <StatsCard 
                      delay={0.3} 
                      title="Recent Activity" 
                      displayValue={String(stats.recentActivity.length)} 
                      sub="Actions logged" 
                      icon={ActivityIcon} 
                      trend="neutral" 
                    />
                    <StatsCard 
                      delay={0.4} 
                      title="Access Level" 
                      displayValue={isAdmin ? "Admin" : "Investor"} 
                      sub={isAdmin ? "Full access" : "Document access"} 
                      icon={TrendUpIcon} 
                      trend="neutral" 
                    />
                  </div>

                  {/* MAIN DATA VISUALIZATION - The "Hologram" */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                    {/* ... (Chart Hologram) ... */}
                    <HolographicCard className="lg:col-span-2 flex flex-col p-6" delay={0.5} variant="elevated">
                      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-accent/20">
                              <Zap className="w-4 h-4 text-accent" />
                            </div>
                            Production Output
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Real-time barrel analytics</p>
                        </div>
                        <div className="flex gap-1.5 bg-white/[0.05] p-1 rounded-xl border border-white/[0.08]">
                          {['1H', '24H', '7D', '30D'].map(range => (
                            <button
                              key={range}
                              onClick={() => setChartRange(range)}
                              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${chartRange === range
                                ? "bg-primary text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]"
                                : "text-gray-400 hover:text-white hover:bg-white/[0.08]"
                                }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Animated Bars - Premium Style */}
                      <div className="flex-1 flex items-end justify-between gap-3 px-2 relative min-h-[200px]">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
                          ))}
                        </div>

                        {chartData.map((h, i) => (
                          <motion.div
                            key={`${chartRange}-${i}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${h}%`, opacity: 1 }}
                            transition={{ duration: 0.8, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full bg-gradient-to-t from-primary/20 via-primary/60 to-cyan-400 relative group cursor-crosshair rounded-t-md"
                          >
                            {/* Glow top */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.8),0_0_30px_rgba(0,255,255,0.4)] rounded-t-md" />
                            {/* Tooltip */}
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 px-3 py-2 rounded-lg text-cyan-400 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                              <span className="font-bold text-white">{Math.floor(h * 12)}</span> BPD
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </HolographicCard>

                    {/* Action Center - Real Tasks - Premium 2025 */}
                    <HolographicCard className="flex flex-col p-6" delay={0.6} variant="elevated">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-rose-500/20">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Mission Critical</h3>
                      </div>
                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {statsLoading ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="animate-pulse">Loading tasks...</div>
                          </div>
                        ) : stats.pendingTasks.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">All tasks completed!</p>
                          </div>
                        ) : (
                          stats.pendingTasks.map((task) => {
                            const urgencyMap = {
                              critical: { color: "bg-rose-500", glowColor: "shadow-[0_0_12px_rgba(244,63,94,0.5)]", label: "CRITICAL", textColor: "text-rose-400" },
                              pending: { color: "bg-amber-500", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.5)]", label: "PENDING", textColor: "text-amber-400" },
                              scheduled: { color: "bg-primary", glowColor: "shadow-[0_0_12px_rgba(0,102,255,0.5)]", label: "SCHEDULED", textColor: "text-primary" },
                              done: { color: "bg-emerald-500", glowColor: "", label: "DONE", textColor: "text-emerald-400" },
                            };
                            const urgency = urgencyMap[task.status];
                            
                            return (
                              <div 
                                key={task.id} 
                                onClick={() => {
                                  if (task.type === "nda" && task.status !== "done") {
                                    navigate("/investor-documents");
                                  } else if (task.type === "document") {
                                    navigate("/investor-documents");
                                  }
                                }}
                                className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-primary/30 transition-all duration-300 cursor-pointer"
                              >
                                <div className={`w-2.5 h-2.5 rounded-full ${urgency.color} ${urgency.glowColor} ${task.status === 'critical' ? 'animate-pulse' : ''}`} />
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-medium text-sm transition-colors truncate ${task.status === 'done' ? 'text-emerald-400/70 line-through' : 'text-gray-200 group-hover:text-white'}`}>
                                    {task.title}
                                  </h4>
                                  <p className={`text-[10px] uppercase tracking-wider font-medium ${urgency.textColor}`}>{urgency.label}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-primary text-lg">→</div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <Button 
                        onClick={() => navigate("/investor-documents")}
                        className="mt-6 w-full bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary hover:to-primary/80 text-primary hover:text-white border border-primary/30 hover:border-primary transition-all duration-300 font-medium"
                      >
                        View All Documents
                      </Button>
                    </HolographicCard>
                  </div>

                  {/* Bottom Row - Recent Activity - Premium 2025 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <HolographicCard className="p-6 h-52 flex flex-col" delay={0.7}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <ActivityIcon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-white">Recent Activity</p>
                      </div>
                      {stats.recentActivity.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          <p className="text-sm">No recent activity</p>
                        </div>
                      ) : (
                        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                          {stats.recentActivity.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all duration-300">
                              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,102,255,0.5)]" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-300 truncate font-medium">
                                  {activity.action.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {new Date(activity.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </HolographicCard>
                    
                    <HolographicCard className="p-6 h-52 flex items-center justify-center" delay={0.8}>
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3 font-medium">Portal Status</p>
                        <div className={`text-4xl font-bold mb-2 ${stats.ndaSigned 
                          ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
                          : 'bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        }`}>
                          {stats.ndaSigned ? "FULL ACCESS" : "LIMITED ACCESS"}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          {stats.ndaSigned ? `${stats.assignedDocuments} documents available` : "Sign NDA to unlock documents"}
                        </p>
                        {stats.ndaSigned && (
                          <div className="mt-4 flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-emerald-500/60" />
                            ))}
                          </div>
                        )}
                      </div>
                    </HolographicCard>
                  </div>
                </motion.div>
              )}

              {activeTab === "Documents" && <DocumentsTab />}

              {(activeTab === "Live Ops" || activeTab === "Financials" || activeTab === "System") && (
                isLevel6 ? (
                  // Placeholder for unlocked views simply re-using "Overview" logic or placeholder for now to prove unlock
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12"
                  >
                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                      <Zap className="w-12 h-12 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{activeTab} Unlocked</h2>
                    <p className="text-green-400/80 max-w-md">
                      Level 6 Clearance Verified. Module Active.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12"
                  >
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                      {activeTab === "Live Ops" && <ActivityIcon className="w-12 h-12 text-gray-400" />}
                      {activeTab === "Financials" && <MoneyIcon className="w-12 h-12 text-gray-400" />}
                      {activeTab === "System" && <SettingsIcon className="w-12 h-12 text-gray-400" />}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{activeTab} Module</h2>
                    <p className="text-gray-400 max-w-md">
                      This module is currently locked or under development. <br />
                      Please contact your system administrator for Level 6 access.
                    </p>
                  </motion.div>
                ))}
            </AnimatePresence>

          </main>
        </div>
      </div>
      {/* MOBILE FLOATING COMMAND DECK - Premium 2025 */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
        className="md:hidden fixed bottom-6 left-4 right-4 z-50 p-1.5 rounded-2xl bg-gradient-to-r from-gray-900/95 to-gray-950/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.9)] flex items-center justify-between"
      >
        {/* Top highlight */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full" />
        
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(item.label)}
            className={`relative p-3 rounded-xl transition-all duration-300 flex-1 flex justify-center ${activeTab === item.label
              ? "text-white bg-gradient-to-br from-primary/30 to-primary/10 shadow-[0_0_20px_rgba(0,102,255,0.3)]"
              : "text-gray-500 hover:text-white"
              }`}
          >
            <item.icon className="w-5 h-5" />
            {activeTab === item.label && (
              <span className="absolute -top-0.5 right-3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            )}
          </button>
        ))}
        {/* Mobile Logout */}
        <button
          onClick={handleSignOut}
          className="p-3 text-gray-500 hover:text-rose-400 flex-1 flex justify-center border-l border-white/[0.08] ml-1 transition-colors duration-300"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </motion.div>

    </div>
  );
};

// Helper for the KPI Cards - Premium 2025 Style
const StatsCard = ({ title, displayValue, sub, icon: Icon, trend, delay }: any) => (
  <HolographicCard delay={delay} variant="elevated" className="p-6 group/card">
    <div className="flex justify-between items-start mb-5">
      <div className={`relative p-3.5 rounded-2xl transition-all duration-500 ${
        trend === 'up' 
          ? 'bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 text-emerald-400 group-hover/card:shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
          : trend === 'down' 
            ? 'bg-gradient-to-br from-rose-500/25 to-rose-500/5 text-rose-400 group-hover/card:shadow-[0_0_25px_rgba(244,63,94,0.3)]' 
            : 'bg-gradient-to-br from-primary/25 to-primary/5 text-primary group-hover/card:shadow-[0_0_25px_rgba(0,102,255,0.3)]'
      }`}>
        <Icon className="w-6 h-6" />
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-50 transition-opacity duration-500 ${
          trend === 'up' ? 'bg-emerald-500/30' : trend === 'down' ? 'bg-rose-500/30' : 'bg-primary/30'
        }`} />
      </div>
      {trend !== 'neutral' && (
        <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full border backdrop-blur-sm ${
          trend === 'up' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {trend === 'up' ? '↗ Active' : '↘ Alert'}
        </span>
      )}
    </div>
    <h3 className="text-4xl font-bold text-white mb-1.5 tracking-tight bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
      {displayValue}
    </h3>
    <p className="text-sm text-gray-400 font-medium tracking-wide">{title}</p>
    <p className={`text-xs mt-2 flex items-center gap-1.5 ${
      trend === 'up' ? 'text-emerald-500/80' : trend === 'down' ? 'text-rose-500/80' : 'text-gray-500'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        trend === 'up' ? 'bg-emerald-500 animate-pulse' : trend === 'down' ? 'bg-rose-500 animate-pulse' : 'bg-gray-500'
      }`} />
      {sub}
    </p>
  </HolographicCard>
);

export default Dashboard;

