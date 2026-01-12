import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(1, "Name is required");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      toast.error("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (isSignUp) {
        nameSchema.parse(fullName);
      }

      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("An account with this email already exists. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          setShowVerificationMessage(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center px-4 relative overflow-hidden">
      {/* Premium Background - Matching Homepage/Dashboard */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-midnight" />
        {/* Radial gradient matching Hero */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-midnight to-midnight" />
        {/* Dramatic glow orbs */}
        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-accent/15 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        {/* Holographic grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] pointer-events-none" />
      </div>

      {/* Floating Background Typography */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015]">
          <h1 className="text-[40vw] font-black leading-none text-white tracking-tighter whitespace-nowrap">
            ACCESS
          </h1>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Login Card - Enhanced Glassmorphism */}
        <div className="relative group">
          {/* Holographic grid on hover */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]" />
          
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-[-1px] rounded-[2rem] bg-gradient-to-r from-primary/40 via-accent/20 to-primary/40 blur-sm animate-gradient" />
          </div>

          {/* Card background */}
          <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] p-8 overflow-hidden">
            {/* Inner glass */}
            <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-gradient-to-br from-midnight/95 to-[#010308]/98 pointer-events-none -z-10" />
            
            {/* Top highlight */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
            {showVerificationMessage ? (
              <div className="text-center space-y-4 relative z-10">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Check your email
                </h1>
                <p className="text-gray-400 text-sm">
                  We've sent a verification link to <strong className="text-white">{email}</strong>.
                  Please click the link in your email to verify your account.
                </p>
                <p className="text-gray-500 text-xs">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:border-primary/40 transition-all"
                  onClick={() => {
                    setShowVerificationMessage(false);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setIsSignUp(false);
                  }}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="relative w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl text-white shadow-[0_4px_30px_rgba(0,102,255,0.5)]">
                    B
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                    Investor Portal
                  </h1>
                  <p className="text-gray-400">
                    {isSignUp ? "Create your account" : "Sign in to access your account"}
                  </p>
                </div>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-6 h-12 bg-white/[0.03] border-white/[0.1] text-white hover:bg-white/[0.08] hover:border-primary/40 transition-all duration-300"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    "Connecting..."
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-midnight px-3 text-gray-500 tracking-wider">or continue with email</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-300 text-sm font-medium">
                        Full Name
                      </Label>
                      <div className="relative group/input">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 h-12 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-gray-600 focus:bg-white/[0.06] focus:border-primary/50 rounded-xl transition-all"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative group/input">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-gray-600 focus:bg-white/[0.06] focus:border-primary/50 rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative group/input">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-gray-600 focus:bg-white/[0.06] focus:border-primary/50 rounded-xl transition-all"
                        required
                      />
                    </div>
                    {isSignUp && (
                      <p className="text-xs text-gray-500">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {!isSignUp && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer group/check">
                        <input type="checkbox" className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50" />
                        <span className="text-gray-400 group-hover/check:text-gray-300 transition-colors">Remember me</span>
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold uppercase tracking-wider shadow-[0_4px_30px_rgba(0,102,255,0.4)] hover:shadow-[0_4px_40px_rgba(0,102,255,0.6)] transition-all duration-300 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>
                </form>

                {/* Toggle Sign In/Up */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-gray-400 text-sm">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-primary hover:text-accent font-semibold transition-colors"
                    >
                      {isSignUp ? "Sign in" : "Create one"}
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Name */}
        <p className="text-center text-gray-600 mt-8 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
