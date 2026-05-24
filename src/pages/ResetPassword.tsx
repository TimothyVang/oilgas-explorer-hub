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
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4"><div className="h-12 w-12 animate-kinetic-spin rounded-full border-4 border-primary border-t-white" /><span className="kinetic-label text-sm text-primary">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,155,76,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.16)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="kinetic-heading text-[20vw] text-primary opacity-[0.08]">
          SECURE
        </span>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link 
          to="/login" 
          className="kinetic-label mb-8 inline-flex items-center gap-2 text-primary transition-transform hover:translate-x-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="border-2 border-primary bg-[#08263F] p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary font-mono text-lg font-bold text-secondary">
              B
            </div>
            <h1 className="kinetic-heading mb-1 text-5xl text-white">
              {isSuccess ? "Password Updated" : "Set New Password"}
            </h1>
            <p className="kinetic-label text-xs text-primary">
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
                <Button className="h-12 w-full rounded-full border-primary bg-primary text-secondary hover:bg-white">
                  Request New Link
                </Button>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-primary bg-primary text-secondary">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-white/60 text-sm">
                You can now sign in with your new password.
              </p>
              <Button 
                className="h-12 w-full rounded-full border-primary bg-primary text-secondary hover:bg-white"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="kinetic-label text-xs text-primary">
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
                    className="h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary"
                    required
                    autoComplete="new-password"
                    enterKeyHint="next"
                  />
                </div>
                <p className="text-xs text-white/40">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="kinetic-label text-xs text-primary">
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
                    className="h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary"
                    required
                    autoComplete="new-password"
                    enterKeyHint="done"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full rounded-full border-primary bg-primary text-secondary hover:bg-white"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>

        {/* Company Name */}
        <p className="kinetic-label mt-8 text-center text-xs text-primary/70">
          © {new Date().getFullYear()} BAH Oil LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
