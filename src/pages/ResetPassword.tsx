import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserMessage } from "@/lib/errorMessages";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      setIsChecking(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      passwordSchema.parse(password);

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(getUserMessage(error));
      } else {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /><span className="text-white/60 text-sm">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background - matches homepage Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />
      
      {/* Single centered glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Bold background typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[15vw] font-black tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent opacity-[0.03]">
          SECURE
        </span>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Card - Clean glassmorphism */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg text-white">
              B
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isSuccess ? "Password Updated" : "Set New Password"}
            </h1>
            <p className="text-white/60 text-sm">
              {isSuccess 
                ? "Your password has been successfully updated" 
                : "Enter your new password below"}
            </p>
          </div>

          {!isValidSession && !isSuccess ? (
            <div className="text-center space-y-4">
              <p className="text-white/60 text-sm">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link to="/forgot-password">
                <Button className="w-full h-11 bg-white text-midnight font-semibold hover:bg-white/90 transition-all rounded-lg">
                  Request New Link
                </Button>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-white/60 text-sm">
                You can now sign in with your new password.
              </p>
              <Button 
                className="w-full h-11 bg-white text-midnight font-semibold hover:bg-white/90 transition-all rounded-lg"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70 text-sm">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg"
                    required
                  />
                </div>
                <p className="text-xs text-white/40">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/70 text-sm">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-white text-midnight font-semibold hover:bg-white/90 transition-all rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>

        {/* Company Name */}
        <p className="text-center text-white/30 mt-8 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;