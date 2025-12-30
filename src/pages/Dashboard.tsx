import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Building2, Phone, LogOut, Settings, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, company_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data);
      }
      setLoadingProfile(false);
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-primary-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <div className="bg-card rounded-lg shadow-2xl p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Welcome to Your Portal
            </h1>
            <p className="text-muted-foreground">
              {user.email}
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-card-foreground border-b border-border pb-2">
              Profile Information
            </h2>
            
            {loadingProfile ? (
              <p className="text-muted-foreground">Loading profile...</p>
            ) : (
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="text-card-foreground font-medium">
                      {profile?.full_name || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Building2 className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="text-card-foreground font-medium">
                      {profile?.company_name || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Phone className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-card-foreground font-medium">
                      {profile?.phone || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/profile")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => navigate("/admin")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              )}
              {!isAdmin && (
                <Button variant="outline" className="w-full" disabled>
                  Contact Support
                </Button>
              )}
            </div>
            <p className="text-center text-muted-foreground text-sm mt-4">
              More features coming soon
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-foreground/60 mt-8 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
