import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
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
  Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentsTab } from "@/components/dashboard/DocumentsTab";
import heroImage from "@/assets/pump-jacks.jpg"; // Re-using the hero image for background texture

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [chartRange, setChartRange] = useState("24H");

  // Mock data generator based on range
  const getChartData = (range: string) => {
    switch (range) {
      case '1H': return [65, 70, 75, 72, 80, 85, 82, 90, 95, 88, 92, 98];
      case '24H': return [45, 78, 55, 90, 48, 70, 85, 62, 75, 52, 68, 95];
      case '7D': return [60, 55, 70, 65, 80, 75, 85, 90, 88, 92, 95, 90];
      case '30D': return [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
      default: return [45, 78, 55, 90, 48, 70, 85, 62, 75, 52, 68, 95];
    }
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

      {/* 1. FLUID BACKGROUND (Nuclear Option) */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#020410]" /> {/* Deep base */}
        {/* Removed external noise.svg dependency - using CSS grain effect instead */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-noise-pattern opacity-20 brightness-150 contrast-150 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[150px] animate-blob animation-delay-4000 mix-blend-screen" />

        {/* Grid Overlay for 'Tactical' feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="relative z-10 flex h-dvh md:h-screen p-4 md:p-6 gap-6 flex-col md:flex-row">

        {/* 2. FLOATING SIDEBAR (Desktop) */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="w-24 hidden md:flex flex-col items-center py-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Brand Mark */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl shadow-[0_0_20px_hsla(var(--primary),0.5)] mb-12">
            B
          </div>

          {/* Nav Items */}
          <nav className="flex-1 flex flex-col gap-6 w-full px-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(item.label)}
                className={`relative group flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === item.label
                  ? "bg-primary text-white shadow-[0_0_20px_hsla(var(--primary),0.4)]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
              >
                <item.icon className="w-6 h-6" />
                {/* Tooltip */}
                <span className="absolute left-16 bg-black/80 backdrop-blur text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button onClick={handleSignOut} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto">
            <LogOut className="w-6 h-6" />
          </button>
        </motion.aside>

        {/* 3. MAIN HUD AREA */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden">

          {/* Header HUD */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 md:px-8 py-3 md:py-4 shadow-lg shrink-0"
          >
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                <span className="hidden md:inline">COMMAND CENTER // </span>
                <span className="md:hidden">CMD // </span>
                <span className="text-primary">{activeTab.toUpperCase()}</span>
              </h1>
              <p className="text-xs text-cyan-400/80 tracking-widest uppercase mt-1">System Operational • {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-mono">LIVE DATA FEED</span>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{user?.user_metadata?.full_name || "Tim Vang"}</p>
                  <p className="text-xs text-gray-500 mt-1">{isLevel6 ? "Level 6 Access" : "Level 5 Access"}</p>
                </div>
                <div className="w-10 h-10 rounded-full ring-2 ring-primary/50 ring-offset-2 ring-offset-[#020410] bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center font-bold">
                  {user?.email?.[0]?.toUpperCase() || "TV"}
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
                  {/* KPI ROW - 3D Tilted Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
                    <StatsCard delay={0.1} title="Total Investment" displayValue="$2.4M" sub="+12.5% vs last month" icon={TrendUpIcon} trend="up" />
                    <StatsCard delay={0.2} title="Active Wells" displayValue="14" sub="+2 new drills" icon={ActivityIcon} trend="up" />
                    <StatsCard delay={0.3} title="Docs Signed" displayValue="8/12" sub="4 pending review" icon={DocsIcon} trend="neutral" />
                    <StatsCard delay={0.4} title="Net Production" displayValue="450 bpd" sub="-1.2% maintenance" icon={ChartIcon} trend="down" />
                  </div>

                  {/* MAIN DATA VISUALIZATION - The "Hologram" */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                    {/* ... (Chart Hologram) ... */}
                    <HolographicCard className="lg:col-span-2 flex flex-col p-6" delay={0.5}>
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent" /> Production Output
                          </h3>
                          <p className="text-sm text-gray-400">Real-time barrel analytics</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                          {['1H', '24H', '7D', '30D'].map(range => (
                            <button
                              key={range}
                              onClick={() => setChartRange(range)}
                              className={`px-3 py-1 text-xs rounded-md border transition-all duration-300 ${chartRange === range
                                ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                                : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Animated Bars */}
                      <div className="flex-1 flex items-end justify-between gap-4 px-2 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 border-t border-b border-white/5 flex flex-col justify-between pointer-events-none">
                          {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white/5 border-dashed" />)}
                        </div>

                        {chartData.map((h, i) => (
                          <motion.div
                            key={`${chartRange}-${i}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${h}%`, opacity: 1 }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: "backOut" }}
                            className="w-full bg-gradient-to-t from-primary/10 via-primary/50 to-cyan-400 relative group cursor-crosshair rounded-t-sm"
                          >
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-200 shadow-[0_0_10px_#00ffff]" />
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 border border-cyan-500/30 px-2 py-1 rounded text-cyan-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                              {Math.floor(h * 12)} BPD
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </HolographicCard>

                    {/* Action Center - UPDATED COLORS */}
                    <HolographicCard className="flex flex-col p-6" delay={0.6}>
                      <h3 className="text-lg font-bold text-white mb-6">Mission Critical</h3>
                      <div className="space-y-4">
                        {[
                          { title: "Sign Alpha NDA", time: "CRITICAL", urgency: "high" },
                          { title: "Q4 Financial Review", time: "Pending", urgency: "med" },
                          { title: "Well #4 Sensor Check", time: "Scheduled", urgency: "low" },
                          { title: "Update Investor Deck", time: "Done", urgency: "done" }
                        ].map((item, i) => (
                          <div key={i} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-primary/20 hover:to-transparent border border-white/5 hover:border-primary/30 transition-all cursor-pointer">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${item.urgency === 'high' ? 'bg-red-500 text-red-500 animate-pulse' :
                              item.urgency === 'med' ? 'bg-orange-500 text-orange-500' :
                                item.urgency === 'low' ? 'bg-blue-500 text-blue-500' :
                                  'bg-green-500 text-green-500' // UPDATED TO GREEN
                              }`} />
                            <div className="flex-1">
                              <h4 className={`font-medium text-sm transition-colors ${item.urgency === 'done' ? 'text-green-400/80 line-through' : 'text-gray-200 group-hover:text-white'}`}>
                                {item.title}
                              </h4>
                              <p className="text-[10px] uppercase tracking-wider text-gray-500">{item.time}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">→</div>
                          </div>
                        ))}
                      </div>

                      <Button className="mt-auto w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 shadow-[0_0_20px_bg-primary/10]">
                        View All Tasks
                      </Button>
                    </HolographicCard>
                  </div>

                  {/* Bottom Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <HolographicCard className="p-6 h-48 flex items-center justify-center border-dashed border-white/10" delay={0.7}>
                      <div className="text-center text-gray-500">
                        <p className="text-sm uppercase tracking-widest mb-2">System Status</p>
                        <div className="text-3xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">ALL SYSTEMS NOMINAL</div>
                      </div>
                    </HolographicCard>
                    <HolographicCard className="p-6 h-48 flex items-center justify-center border-dashed border-white/10" delay={0.8}>
                      <div className="text-center text-gray-500">
                        <p className="text-sm uppercase tracking-widest mb-2">Revenue Forecast</p>
                        <div className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">+145%</div>
                        <p className="text-xs text-gray-600 mt-1">Confidence Interval: 98%</p>
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
      {/* MOBILE FLOATING COMMAND DECK */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
        className="md:hidden fixed bottom-6 left-6 right-6 z-50 p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-between"
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(item.label)}
            className={`relative p-3 rounded-xl transition-all duration-300 flex-1 flex justify-center ${activeTab === item.label
              ? "text-primary bg-white/10 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              : "text-gray-500 hover:text-white"
              }`}
          >
            <item.icon className="w-5 h-5" />
            {activeTab === item.label && (
              <span className="absolute -top-1 right-2 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_#4ade80]" />
            )}
          </button>
        ))}
        {/* Mobile Logout */}
        <button
          onClick={handleSignOut}
          className="p-3 text-red-400/80 hover:text-red-400 flex-1 flex justify-center border-l border-white/10 ml-1"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </motion.div>

    </div>
  );
};

// Helper for the KPI Cards
const StatsCard = ({ title, displayValue, sub, icon: Icon, trend, delay }: any) => (
  <HolographicCard delay={delay} className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${trend === 'up' ? 'from-green-500/20 to-green-500/5 text-green-400' :
        trend === 'down' ? 'from-red-500/20 to-red-500/5 text-red-400' :
          'from-blue-500/20 to-blue-500/5 text-blue-400'
        }`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend !== 'neutral' && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${trend === 'up' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
          'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          {trend === 'up' ? '↗' : '↘'}
        </span>
      )}
    </div>
    <h3 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{displayValue}</h3>
    <p className="text-sm text-gray-400 font-medium">{title}</p>
    <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-500/70' : trend === 'down' ? 'text-red-500/70' : 'text-gray-600'}`}>
      {sub}
    </p>
  </HolographicCard>
);

export default Dashboard;

