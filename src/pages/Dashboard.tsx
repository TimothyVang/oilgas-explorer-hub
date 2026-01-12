import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useInvestorDashboard } from "@/hooks/useInvestorDashboard";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  DocsIcon,
  ActivityIcon,
} from "@/components/Icons";
import { Home } from "lucide-react";
import {
  LogOut,
  CheckCircle,
  AlertCircle,
  User,
  Shield
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentsTab } from "@/components/dashboard/DocumentsTab";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActivitySkeleton } from "@/components/loading/PageLoadingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const { stats, loading: statsLoading } = useInvestorDashboard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAllActivity, setShowAllActivity] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: HomeIcon, label: "Overview", action: () => setActiveTab("Overview") },
    { icon: DocsIcon, label: "Documents", action: () => setActiveTab("Documents") },
    { icon: User, label: "Profile", action: () => navigate("/profile") },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", action: () => navigate("/admin") }] : []),
  ];

  return (
    <div className="min-h-screen bg-midnight text-white font-sans overflow-hidden relative">

      {/* Background - Matches Hero.tsx exactly */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-midnight to-midnight" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
      </div>

      {/* Large Background Typography - Same as Hero "EVOLVED" */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden flex items-center justify-center">
        <h1 className="text-[15vw] font-black uppercase leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter opacity-[0.05]">
          ACCESS
        </h1>
      </div>

      <div className="relative z-10 flex h-dvh md:h-screen p-4 md:p-6 gap-6 flex-col md:flex-row">

        {/* Sidebar (Desktop) */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-20 hidden md:flex flex-col items-center py-8 border-r border-white/10"
        >
          {/* Brand Mark */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="/" 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-lg text-white mb-10 hover:scale-105 transition-transform"
                >
                  B
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Go to Homepage</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Nav Items */}
          <TooltipProvider delayDuration={0}>
            <nav className="flex-1 flex flex-col gap-2 w-full px-3">
              {menuItems.map((item, index) => {
                const isActive = (item.label === "Overview" || item.label === "Documents") && activeTab === item.label;
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={item.action}
                        className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${isActive
                          ? "bg-primary/20 text-white border border-primary/30"
                          : "text-white/40 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>

          {/* Logout */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleSignOut} 
                  className="flex flex-col items-center gap-1 p-3 text-white/40 hover:text-rose-400 rounded-xl transition-all mt-auto"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[10px]">Logout</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">

          {/* Header */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between border-b border-white/10 pb-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                {activeTab}
              </h1>
              <p className="text-sm text-white/40 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white/80">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}</p>
                <p className="text-xs text-white/40">{isAdmin ? "Admin" : "Investor"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-semibold text-white text-sm">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </motion.header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto pb-24 md:pb-4 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "Overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Stats Row - Matches homepage Stats section */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-b border-white/10 py-8">
                    <StatCard 
                      label="NDA Status" 
                      value={stats.ndaSigned ? "Signed" : "Pending"} 
                    />
                    <StatCard 
                      label="Documents" 
                      value={String(stats.assignedDocuments)} 
                    />
                    <StatCard 
                      label="Activity" 
                      value={String(stats.recentActivity.length)} 
                    />
                    <StatCard 
                      label="Access" 
                      value={isAdmin ? "Admin" : "Investor"} 
                    />
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Activity Timeline */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold uppercase tracking-wide text-white/60">Recent Activity</h3>
                        {stats.recentActivity.length > 5 && (
                          <button
                            onClick={() => setShowAllActivity(!showAllActivity)}
                            className="text-sm text-primary hover:text-white transition-colors"
                          >
                            {showAllActivity ? "Show Less" : "View All"}
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {statsLoading ? (
                          <ActivitySkeleton count={5} />
                        ) : stats.recentActivity.length === 0 ? (
                          <div className="text-center py-12 border border-white/10 rounded-xl">
                            <p className="text-white/40">No activity yet</p>
                          </div>
                        ) : (
                          (showAllActivity ? stats.recentActivity : stats.recentActivity.slice(0, 5)).map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-4 p-4 border border-white/10 rounded-xl hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/80 truncate">
                                  {activity.action.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                </p>
                                <p className="text-xs text-white/40">{new Date(activity.created_at).toLocaleString()}</p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold uppercase tracking-wide text-white/60">Tasks</h3>
                      
                      <div className="space-y-2">
                        {statsLoading ? (
                          <ActivitySkeleton count={5} />
                        ) : stats.pendingTasks.length === 0 ? (
                          <div className="text-center py-8 border border-white/10 rounded-xl">
                            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-white/40 text-sm">All done!</p>
                          </div>
                        ) : (
                          stats.pendingTasks.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => {
                                if (task.type === "nda" || task.type === "document") {
                                  navigate("/investor-documents");
                                }
                              }}
                              className="w-full flex items-center gap-3 p-4 border border-white/10 rounded-xl hover:bg-white/[0.02] hover:border-primary/30 transition-all text-left"
                            >
                              <div className={`w-2 h-2 rounded-full ${task.status === 'critical' ? 'bg-rose-500 animate-pulse' : task.status === 'pending' ? 'bg-amber-500' : 'bg-primary'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/80 truncate">{task.title}</p>
                                <p className="text-xs text-white/40 uppercase">{task.status}</p>
                              </div>
                              <span className="text-white/30">→</span>
                            </button>
                          ))
                        )}
                      </div>

                      <Button 
                        onClick={() => navigate("/investor-documents")}
                        className="w-full mt-4 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 transition-all"
                      >
                        View Documents
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <button 
                      onClick={() => navigate("/investor-documents")}
                      className="flex items-center gap-3 p-4 border border-white/10 rounded-xl hover:bg-white/[0.02] hover:border-primary/30 transition-all"
                    >
                      <DocsIcon className="w-5 h-5 text-primary" />
                      <span className="text-sm text-white/80">View Documents</span>
                    </button>
                    <button 
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-3 p-4 border border-white/10 rounded-xl hover:bg-white/[0.02] hover:border-primary/30 transition-all"
                    >
                      <User className="w-5 h-5 text-primary" />
                      <span className="text-sm text-white/80">Edit Profile</span>
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-3 p-4 border border-white/10 rounded-xl hover:bg-white/[0.02] hover:border-primary/30 transition-all"
                      >
                        <Shield className="w-5 h-5 text-rose-400" />
                        <span className="text-sm text-white/80">Admin Dashboard</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "Documents" && <DocumentsTab />}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        className="md:hidden fixed bottom-4 left-4 right-4 z-50 p-2 rounded-2xl bg-midnight/95 backdrop-blur-lg border border-white/10 flex items-center justify-around"
      >
        <Link to="/" className="p-3 text-white/40 hover:text-white transition-colors">
          <Home className="w-5 h-5" />
        </Link>

        {menuItems.map((item, index) => {
          const isActive = (item.label === "Overview" || item.label === "Documents") && activeTab === item.label;
          return (
            <button
              key={index}
              onClick={item.action}
              className={`p-3 rounded-xl transition-all ${isActive ? "text-white bg-primary/20" : "text-white/40 hover:text-white"}`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          );
        })}

        <button onClick={handleSignOut} className="p-3 text-white/40 hover:text-rose-400 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

// Simple stat card matching homepage Stats component style
const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center group">
    <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-accent mb-2">
      {value}
    </div>
    <p className="text-white/40 text-sm uppercase tracking-wide group-hover:text-primary transition-colors">
      {label}
    </p>
  </div>
);

export default Dashboard;
