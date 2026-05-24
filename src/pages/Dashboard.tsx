import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Home, LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useInvestorDashboard } from "@/hooks/useInvestorDashboard";
import { DocsIcon, HomeIcon } from "@/components/Icons";
import { DocumentsTab } from "@/components/dashboard/DocumentsTab";
import { ActivitySkeleton } from "@/components/loading/PageLoadingSkeleton";

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
    { icon: DocsIcon, label: "Deal Room", action: () => setActiveTab("Deal Room") },
    { icon: User, label: "Profile", action: () => navigate("/profile") },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", action: () => navigate("/admin") }] : []),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary text-white">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(192,155,76,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <h1 className="kinetic-heading text-[18vw] text-primary opacity-[0.06]">ACCESS</h1>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden w-24 flex-col items-center border-2 border-primary bg-[#08263F] py-6 md:flex"
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/" className="mb-8 flex h-14 w-14 items-center justify-center border-2 border-primary bg-primary font-mono text-xl font-bold text-secondary transition-transform hover:scale-110">
                  B
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Go to Homepage</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <nav className="flex flex-1 flex-col gap-3">
              {menuItems.map((item) => {
                const isActive = (item.label === "Overview" || item.label === "Deal Room") && activeTab === item.label;
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={item.action}
                        className={`flex h-12 w-12 items-center justify-center border-2 transition-all duration-300 hover:translate-x-2 ${isActive ? "border-primary bg-primary text-secondary" : "border-white/30 bg-secondary text-white hover:border-primary hover:text-primary"}`}
                      >
                        <item.icon className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>

          <button onClick={handleSignOut} className="mt-auto flex flex-col items-center gap-1 p-2 font-mono text-[10px] uppercase text-white/60 transition-colors hover:text-primary">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <motion.header initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-2 border-primary bg-[#08263F] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kinetic-label mb-2 text-xs text-primary">Investor command deck</p>
                <h1 className="kinetic-heading text-5xl text-white md:text-7xl">{activeTab}</h1>
                <p className="kinetic-label mt-2 text-xs text-white/60">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-xs font-bold uppercase text-white">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}</p>
                  <p className="font-mono text-[10px] uppercase text-primary">{isAdmin ? "Admin" : "Investor"}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary font-mono font-bold text-secondary">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </motion.header>

          <main className="flex-1 overflow-y-auto pb-32 md:pb-4">
            <AnimatePresence mode="wait">
              {activeTab === "Overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="grid grid-cols-2 border-2 border-primary bg-[#08263F] lg:grid-cols-4">
                    <StatCard label="Access Status" value={stats.ndaSigned ? "Active" : "Pending"} />
                    <StatCard label="Assets" value={String(stats.assignedDocuments)} />
                    <StatCard label="Activity" value={String(stats.recentActivity.length)} />
                    <StatCard label="Access" value={isAdmin ? "Admin" : "Investor"} />
                  </div>

                  <StartHerePanel
                    ndaSigned={stats.ndaSigned}
                    assignedDocuments={stats.assignedDocuments}
                    onOpenDealRoom={() => navigate("/investor-documents")}
                  />

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <section className="border-2 border-primary bg-[#08263F] p-5 lg:col-span-2">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="kinetic-label text-sm text-primary">Recent Activity</h3>
                        {stats.recentActivity.length > 5 && (
                          <button onClick={() => setShowAllActivity(!showAllActivity)} className="kinetic-label text-xs text-white transition-transform hover:translate-x-2 hover:text-primary">
                            {showAllActivity ? "Show Less" : "View All"}
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {statsLoading ? (
                          <ActivitySkeleton count={5} />
                        ) : stats.recentActivity.length === 0 ? (
                          <div className="border-2 border-white/20 py-12 text-center font-mono text-sm uppercase text-white/50">No activity yet</div>
                        ) : (
                          (showAllActivity ? stats.recentActivity : stats.recentActivity.slice(0, 5)).map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              className="group flex items-center gap-4 border border-white/20 p-4 transition-colors hover:bg-white/[0.05]"
                            >
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-sm font-bold uppercase text-white group-hover:translate-x-2 transition-transform">
                                  {activity.action.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                </p>
                                <p className="font-mono text-xs text-white/50">{new Date(activity.created_at).toLocaleString()}</p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="border-2 border-primary bg-[#08263F] p-5">
                      <h3 className="kinetic-label mb-4 text-sm text-primary">Tasks</h3>
                      <div className="space-y-2">
                        {statsLoading ? (
                          <ActivitySkeleton count={4} />
                        ) : stats.pendingTasks.length === 0 ? (
                          <div className="border-2 border-white/20 py-8 text-center">
                            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
                            <p className="font-mono text-sm uppercase text-white/60">All clear</p>
                          </div>
                        ) : (
                          stats.pendingTasks.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => {
                                if (task.type === "nda" || task.type === "document") navigate("/investor-documents");
                              }}
                              className="group flex w-full items-center gap-3 border border-white/20 p-4 text-left transition-colors hover:bg-white/[0.05] hover:border-primary"
                            >
                              <div className={`h-2 w-2 rounded-full ${task.status === "critical" ? "bg-red-500" : task.status === "pending" ? "bg-primary" : "bg-white"}`} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-sm font-bold uppercase text-white transition-transform group-hover:translate-x-2">{task.title}</p>
                                <p className="font-mono text-xs uppercase text-primary">{task.status}</p>
                              </div>
                              <span className="text-primary">-&gt;</span>
                            </button>
                          ))
                        )}
                      </div>

                      <Button onClick={() => navigate("/investor-documents")} className="mt-4 w-full border-primary bg-primary text-secondary hover:bg-white">
                        Open Deal Room
                      </Button>
                    </section>
                  </div>

                  <div className="grid grid-cols-1 gap-4 border-2 border-primary bg-[#08263F] p-4 md:grid-cols-3">
                    <QuickAction onClick={() => navigate("/investor-documents")} icon={<DocsIcon className="h-5 w-5" />} label="Open Deal Room" />
                    <QuickAction onClick={() => navigate("/profile")} icon={<User className="h-5 w-5" />} label="Edit Profile" />
                    {isAdmin && <QuickAction onClick={() => navigate("/admin")} icon={<Shield className="h-5 w-5" />} label="Admin Dashboard" />}
                  </div>
                </motion.div>
              )}

              {activeTab === "Deal Room" && <DocumentsTab />}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.35 }} className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around rounded-full border-2 border-primary bg-[#08263F] p-2 md:hidden">
        <Link to="/" className="p-3 text-white/60 hover:text-primary">
          <Home className="h-5 w-5" />
        </Link>
        {menuItems.map((item) => {
          const isActive = (item.label === "Overview" || item.label === "Deal Room") && activeTab === item.label;
          return (
            <button key={item.label} onClick={item.action} className={`rounded-full p-3 ${isActive ? "bg-primary text-secondary" : "text-white/60 hover:text-primary"}`}>
              <item.icon className="h-5 w-5" />
            </button>
          );
        })}
        <button onClick={handleSignOut} className="p-3 text-white/60 hover:text-primary">
          <LogOut className="h-5 w-5" />
        </button>
      </motion.div>
    </div>
  );
};

const StartHerePanel = ({
  ndaSigned,
  assignedDocuments,
  onOpenDealRoom,
}: {
  ndaSigned: boolean;
  assignedDocuments: number;
  onOpenDealRoom: () => void;
}) => {
  const status = !ndaSigned
      ? {
          label: "Access setup",
          title: "Deal room access is active",
          body: "Use your portal credentials to review the private categories BAH has made available to your account.",
          cta: "Open Deal Room",
        }
    : assignedDocuments === 0
      ? {
          label: "Awaiting assignment",
          title: "NDA verified. BAH will assign assets next.",
          body: "You can enter the deal room now. Assigned pitch, financial, mapping, and video assets will appear as BAH releases them to your account.",
          cta: "Check Deal Room",
        }
      : {
          label: "Ready for review",
          title: `${assignedDocuments} private asset${assignedDocuments === 1 ? "" : "s"} assigned`,
          body: "Start with the featured asset, then move through Pitch, Financials, Mapping, Operations, Field Videos, and Management.",
          cta: "Open Deal Room",
        };

  return (
    <section className="grid gap-4 border-2 border-primary bg-[#08263F] p-5 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="kinetic-label mb-2 text-xs text-primary">{status.label}</p>
        <h2 className="kinetic-heading text-3xl text-white md:text-5xl">{status.title}</h2>
        <p className="mt-3 max-w-3xl text-sm text-white/60">{status.body}</p>
      </div>
      <Button onClick={onOpenDealRoom} className="border-primary bg-primary text-secondary hover:bg-white">
        {status.cta}
      </Button>
    </section>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 border-b-2 border-primary p-5 text-center last:border-b-0 odd:border-r-2 md:border-b-0 md:border-r-2 md:last:border-r-0">
    <div className="kinetic-heading mb-2 break-words text-3xl leading-none text-primary sm:text-4xl md:text-5xl">{value}</div>
    <p className="kinetic-label text-xs text-white/70">{label}</p>
  </div>
);

const QuickAction = ({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className="group flex items-center gap-3 border border-white/20 p-4 transition-colors hover:border-primary hover:bg-white/[0.05]">
    <span className="text-primary">{icon}</span>
    <span className="font-mono text-sm font-bold uppercase text-white transition-transform group-hover:translate-x-2">{label}</span>
  </button>
);

export default Dashboard;
