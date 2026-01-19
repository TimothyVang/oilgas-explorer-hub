import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loginSchema, signupSchema, validateForm } from "@/lib/validation";
import { FormError, useFormErrors } from "@/components/ui/form-error";
import { getUserMessage } from "@/lib/errorMessages";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showMFAVerify, setShowMFAVerify] = useState(false);
  const { signIn, signUp, user, loading, mfaRequired, checkMFAStatus } = useAuth();
  const navigate = useNavigate();
  const { errors, setErrors, clearError, clearAllErrors } = useFormErrors();

  useEffect(() => {
    if (!loading && user && !mfaRequired) {
      navigate("/dashboard");
    }
    // Show MFA verification if required
    if (mfaRequired && user) {
      setShowMFAVerify(true);
    }
  }, [user, loading, mfaRequired, navigate]);

  // Clear errors when switching between sign in and sign up
  useEffect(() => {
    clearAllErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignUp]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    });
    
    if (error) {
      console.error("Google OAuth error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
      return;
    }
    
    // Manually redirect to handle iframe environments
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    setIsLoading(true);

    // Validate form data using centralized schemas
    const schema = isSignUp ? signupSchema : loginSchema;
    const formData = isSignUp
      ? { fullName, email, password }
      : { email, password };

    const validation = validateForm(schema, formData);

    if (!validation.success) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("An account with this email already exists. Please sign in instead.");
          } else {
            toast.error(getUserMessage(error));
          }
        } else {
          setShowVerificationMessage(true);
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          if (result.error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else if (result.error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
          } else {
            toast.error(getUserMessage(result.error));
          }
        } else if (result.mfaRequired) {
          // MFA is required, show verification screen
          setShowMFAVerify(true);
        } else {
          toast.success("Welcome back!");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /><span className="text-white/60 text-sm">Checking authentication...</span></div>
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
          ACCESS
        </span>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Login Card - Clean glassmorphism */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">

            {showMFAVerify ? (
              <TwoFactorVerify
                onSuccess={() => {
                  toast.success("Welcome back!");
                  checkMFAStatus();
                  navigate("/dashboard");
                }}
                onBack={() => {
                  setShowMFAVerify(false);
                  // Sign out to allow re-login
                  supabase.auth.signOut();
                }}
              />
            ) : showVerificationMessage ? (
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
                    clearAllErrors();
                  }}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg text-white">
                    B
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Investor Portal
                  </h1>
                  <p className="text-white/60 text-sm">
                    {isSignUp ? "Create your account" : "Sign in to access your account"}
                  </p>
                </div>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-6 h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    "Connecting..."
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                    <span className="bg-transparent px-3 text-white/40">or continue with email</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white/70 text-sm">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            clearError("fullName");
                          }}
                          className={`pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg ${errors.fullName ? "border-red-500/50" : ""}`}
                          required={isSignUp}
                          autoComplete="name"
                          enterKeyHint="next"
                        />
                      </div>
                      <FormError message={errors.fullName} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70 text-sm">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError("email");
                        }}
                        className={`pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg ${errors.email ? "border-red-500/50" : ""}`}
                        required
                        autoComplete="email"
                        enterKeyHint="next"
                      />
                    </div>
                    <FormError message={errors.email} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/70 text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError("password");
                        }}
                        className={`pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg ${errors.password ? "border-red-500/50" : ""}`}
                        required
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        enterKeyHint="done"
                      />
                    </div>
                    <FormError message={errors.password} />
                    {isSignUp && !errors.password && (
                      <p className="text-xs text-white/40">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {!isSignUp && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-white/20 bg-white/5 text-primary" />
                        <span className="text-white/50">Remember me</span>
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-white text-midnight font-semibold hover:bg-white/90 transition-all rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>
                </form>

                {/* Toggle Sign In/Up */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-white/50 text-sm">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-white hover:text-white/80 font-medium transition-colors"
                    >
                      {isSignUp ? "Sign in" : "Create one"}
                    </button>
                  </p>
                </div>
              </div>
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

export default Login;
