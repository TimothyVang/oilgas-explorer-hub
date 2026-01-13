import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  UserPlus,
  FileCheck,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AdminDashboardSkeleton } from "@/components/loading/PageLoadingSkeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, subMonths } from "date-fns";

// Chart configurations
const userGrowthConfig: ChartConfig = {
  users: {
    label: "New Users",
    color: "hsl(215, 100%, 50%)",
  },
  cumulative: {
    label: "Total Users",
    color: "hsl(142, 76%, 36%)",
  },
};

const activityConfig: ChartConfig = {
  login: {
    label: "Logins",
    color: "hsl(215, 100%, 50%)",
  },
  document_download: {
    label: "Downloads",
    color: "hsl(142, 76%, 36%)",
  },
  nda_signed: {
    label: "NDAs Signed",
    color: "hsl(280, 65%, 60%)",
  },
  profile_updated: {
    label: "Profile Updates",
    color: "hsl(38, 92%, 50%)",
  },
};

const documentAccessConfig: ChartConfig = {
  assigned: {
    label: "Documents Assigned",
    color: "hsl(215, 100%, 50%)",
  },
  downloaded: {
    label: "Documents Downloaded",
    color: "hsl(142, 76%, 36%)",
  },
};

const roleDistributionConfig: ChartConfig = {
  admin: {
    label: "Admins",
    color: "hsl(0, 72%, 51%)",
  },
  moderator: {
    label: "Moderators",
    color: "hsl(38, 92%, 50%)",
  },
  user: {
    label: "Users",
    color: "hsl(215, 100%, 50%)",
  },
  none: {
    label: "No Role",
    color: "hsl(215, 15%, 50%)",
  },
};

interface DailyMetric {
  date: string;
  displayDate: string;
  count: number;
  cumulative?: number;
}

interface ActivityMetric {
  date: string;
  displayDate: string;
  login: number;
  document_download: number;
  nda_signed: number;
  profile_updated: number;
}

interface RoleDistribution {
  role: string;
  count: number;
  fill: string;
}

interface StatCard {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

const COLORS = ["hsl(0, 72%, 51%)", "hsl(38, 92%, 50%)", "hsl(215, 100%, 50%)", "hsl(215, 15%, 50%)"];

const ReportingDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();

  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  // Data states
  const [userGrowthData, setUserGrowthData] = useState<DailyMetric[]>([]);
  const [activityData, setActivityData] = useState<ActivityMetric[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisPeriod: 0,
    totalDocuments: 0,
    documentsAssigned: 0,
    ndaSignedCount: 0,
    activeUsersThisPeriod: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  const fetchReportData = async () => {
    if (!user || !isAdmin) return;

    try {
      setRefreshing(true);
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, created_at, nda_signed, nda_signed_at");

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch documents
      const { data: documents, error: docsError } = await supabase
        .from("investor_documents")
        .select("id");

      if (docsError) throw docsError;

      // Fetch document access
      const { data: docAccess, error: accessError } = await supabase
        .from("user_document_access")
        .select("id, created_at");

      if (accessError) throw accessError;

      // Fetch activity logs
      const { data: activities, error: activityError } = await supabase
        .from("activity_logs")
        .select("id, action, created_at")
        .gte("created_at", startDate.toISOString());

      if (activityError) throw activityError;

      // Process user growth data
      const dateRange = eachDayOfInterval({
        start: startDate,
        end: new Date(),
      });

      const userGrowth: DailyMetric[] = dateRange.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const newUsers = profiles?.filter(
          (p) => format(new Date(p.created_at), "yyyy-MM-dd") === dateStr
        ).length || 0;

        return {
          date: dateStr,
          displayDate: format(date, "MMM d"),
          count: newUsers,
        };
      });

      // Add cumulative data
      let cumulative = profiles?.filter(
        (p) => new Date(p.created_at) < startDate
      ).length || 0;

      userGrowth.forEach((day) => {
        cumulative += day.count;
        day.cumulative = cumulative;
      });

      setUserGrowthData(userGrowth);

      // Process activity data
      const activityByDay: ActivityMetric[] = dateRange.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayActivities = activities?.filter(
          (a) => format(new Date(a.created_at), "yyyy-MM-dd") === dateStr
        ) || [];

        return {
          date: dateStr,
          displayDate: format(date, "MMM d"),
          login: dayActivities.filter((a) => a.action === "login").length,
          document_download: dayActivities.filter((a) => a.action === "document_download").length,
          nda_signed: dayActivities.filter((a) => a.action === "nda_signed").length,
          profile_updated: dayActivities.filter((a) => a.action === "profile_updated").length,
        };
      });

      setActivityData(activityByDay);

      // Process role distribution
      const roleMap = new Map<string, number>();
      roleMap.set("admin", 0);
      roleMap.set("moderator", 0);
      roleMap.set("user", 0);
      roleMap.set("none", 0);

      const userRoleMap = new Map<string, string>();
      roles?.forEach((r) => userRoleMap.set(r.user_id, r.role));

      profiles?.forEach((p) => {
        const role = userRoleMap.get(p.user_id) || "none";
        roleMap.set(role, (roleMap.get(role) || 0) + 1);
      });

      const roleDist: RoleDistribution[] = [
        { role: "admin", count: roleMap.get("admin") || 0, fill: COLORS[0] },
        { role: "moderator", count: roleMap.get("moderator") || 0, fill: COLORS[1] },
        { role: "user", count: roleMap.get("user") || 0, fill: COLORS[2] },
        { role: "none", count: roleMap.get("none") || 0, fill: COLORS[3] },
      ].filter((r) => r.count > 0);

      setRoleDistribution(roleDist);

      // Calculate stats
      const newUsersInRange = profiles?.filter(
        (p) => new Date(p.created_at) >= startDate
      ).length || 0;

      const activeUserIds = new Set(
        activities?.map((a) => a.action) || []
      );

      const ndaSignedTotal = profiles?.filter((p) => p.nda_signed).length || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        newUsersThisPeriod: newUsersInRange,
        totalDocuments: documents?.length || 0,
        documentsAssigned: docAccess?.length || 0,
        ndaSignedCount: ndaSignedTotal,
        activeUsersThisPeriod: activeUserIds.size,
      });

    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchReportData();
    }
  }, [user, isAdmin, timeRange]);

  const statCards: StatCard[] = useMemo(() => [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "New Users",
      value: stats.newUsersThisPeriod,
      changeLabel: `Last ${timeRange} days`,
      icon: <UserPlus className="h-5 w-5 text-green-500" />,
      trend: stats.newUsersThisPeriod > 0 ? "up" : "neutral",
    },
    {
      title: "Documents",
      value: stats.totalDocuments,
      icon: <FileText className="h-5 w-5 text-purple-500" />,
    },
    {
      title: "NDAs Signed",
      value: stats.ndaSignedCount,
      icon: <FileCheck className="h-5 w-5 text-amber-500" />,
    },
  ], [stats, timeRange]);

  if (authLoading || adminLoading || loadingData) {
    return <AdminDashboardSkeleton />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link to="/admin">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to Admin Dashboard</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Reports & Analytics
                </h1>
                <p className="text-muted-foreground text-sm">
                  Monitor platform metrics and trends
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "7" | "30" | "90")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchReportData()}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">Refresh data</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.changeLabel && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {stat.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                        {stat.changeLabel}
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-full bg-muted/50">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="growth" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Over Time</CardTitle>
                <CardDescription>
                  New user registrations and cumulative total over the last {timeRange} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={userGrowthConfig} className="h-[400px] w-full">
                  <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="var(--color-cumulative)"
                      fill="var(--color-cumulative)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-users)"
                      fill="var(--color-users)"
                      fillOpacity={0.6}
                      strokeWidth={2}
                      name="users"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>
                  Daily activity breakdown over the last {timeRange} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={activityConfig} className="h-[400px] w-full">
                  <BarChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="login"
                      stackId="activity"
                      fill="var(--color-login)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="document_download"
                      stackId="activity"
                      fill="var(--color-document_download)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="nda_signed"
                      stackId="activity"
                      fill="var(--color-nda_signed)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="profile_updated"
                      stackId="activity"
                      fill="var(--color-profile_updated)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                  <CardDescription>
                    User roles across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={roleDistributionConfig} className="h-[300px] w-full">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={roleDistribution}
                        dataKey="count"
                        nameKey="role"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        label={({ role, count, percent }) =>
                          `${role}: ${count} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={true}
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role Summary</CardTitle>
                  <CardDescription>
                    Breakdown by role type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roleDistribution.map((role) => (
                      <div key={role.role} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: role.fill }}
                          />
                          <span className="font-medium capitalize">{role.role}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold">{role.count}</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.totalUsers > 0
                              ? `${((role.count / stats.totalUsers) * 100).toFixed(1)}%`
                              : "0%"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to related sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/admin">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin" state={{ tab: "documents" }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Document Management
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin" state={{ tab: "activity" }}>
                  <Activity className="h-4 w-4 mr-2" />
                  Activity Logs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportingDashboard;
