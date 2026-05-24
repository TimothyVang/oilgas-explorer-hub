import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loginSchema, validateForm } from "@/lib/validation";
import { FormError, useFormErrors } from "@/components/ui/form-error";
import { getUserMessage } from "@/lib/errorMessages";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";
import { siteConfig } from "@/constants/siteConfig";

const loginInstructions = [
  ["01", "Already approved?", "Sign in with the username or email address connected to your BAH investor account."],
  ["02", "Need access?", "Email BAH with your name, firm, and reason for requesting investor review access."],
  ["03", "Access pending?", "The portal keeps confidential materials locked until approval requirements are satisfied."],
  ["04", "Missing materials?", "Approved accounts show only the files BAH has assigned for that investor."],
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMFAVerify, setShowMFAVerify] = useState(false);
  const { signIn, user, loading, mfaRequired, checkMFAStatus } = useAuth();
  const navigate = useNavigate();
  const { errors, setErrors, clearError, clearAllErrors } = useFormErrors();

  useEffect(() => {
    if (!loading && user && !mfaRequired) {
      navigate("/dashboard");
    }

    if (mfaRequired && user) {
      setShowMFAVerify(true);
    }
  }, [user, loading, mfaRequired, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    setIsLoading(true);

    const validation = validateForm(loginSchema, { email, password });

    if (!validation.success && "errors" in validation) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn(email, password);
      if (result.error) {
        if (result.error.message.includes("Invalid login credentials")) {
          toast.error("Invalid username/email or password. Please try again.");
        } else if (result.error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
        } else {
          toast.error(getUserMessage(result.error));
        }
      } else if (result.mfaRequired) {
        setShowMFAVerify(true);
      } else {
        toast.success("Welcome back.");
        navigate("/dashboard");
      }
    } catch (_error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-kinetic-spin rounded-full border-4 border-primary border-t-white" />
          <span className="kinetic-label text-sm text-primary">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(197,169,98,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(197,169,98,0.16)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden">
        <span className="kinetic-heading text-[20vw] text-primary opacity-[0.08]">
          ACCESS
        </span>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <Link
          to="/"
          className="kinetic-label mb-8 inline-flex items-center gap-2 text-primary transition-transform hover:translate-x-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <section className="border-2 border-primary bg-[#08263F] p-6 md:p-8">
            <p className="kinetic-label text-xs text-primary">Investor access instructions</p>
            <h2 className="kinetic-heading mt-3 text-5xl text-white md:text-6xl">Private Portal Access</h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-white/65 md:text-base">
              Sign in to complete access requirements and review the materials BAH has assigned to your account.
            </p>

            <div className="mt-6 space-y-3">
              {loginInstructions.map(([number, title, body]) => (
                <article key={number} className="grid gap-3 border border-primary/50 bg-secondary/70 p-4 sm:grid-cols-[44px_1fr]">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary font-mono text-xs font-bold text-secondary">
                    {number}
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-[-0.02em] text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">{body}</p>
                  </div>
                </article>
              ))}
            </div>

            <a
              href={`mailto:${siteConfig.contact.email}?subject=Investor%20Portal%20Access%20Request`}
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full border-2 border-primary bg-primary px-6 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-secondary transition-transform hover:scale-105 hover:bg-white sm:w-auto"
            >
              Request Access by Email
            </a>
          </section>

          <div className="border-2 border-primary bg-[#08263F] p-8">
            {showMFAVerify ? (
              <TwoFactorVerify
                onSuccess={() => {
                  toast.success("Welcome back.");
                  checkMFAStatus();
                  navigate("/dashboard");
                }}
                onBack={() => {
                  setShowMFAVerify(false);
                  supabase.auth.signOut();
                }}
              />
            ) : (
              <div>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary text-secondary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h1 className="kinetic-heading mb-1 text-5xl text-white">
                    Approved Investor Login
                  </h1>
                  <p className="kinetic-label text-xs text-primary">
                    Invitation-only access to confidential materials
                  </p>
                </div>

                <div className="mb-6 rounded-none border border-primary/40 bg-primary/10 p-4">
                  <p className="text-sm text-white/70">
                    Use the username or email address associated with your BAH investor account. Credentials are provided directly by BAH after review.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="kinetic-label text-xs text-primary">
                      Username or Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        id="email"
                        type="text"
                        placeholder="investor or you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError("email");
                        }}
                        className={`h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary ${errors.email ? "border-red-500" : ""}`}
                        required
                        autoComplete="username"
                        enterKeyHint="next"
                      />
                    </div>
                    <FormError message={errors.email} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="kinetic-label text-xs text-primary">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError("password");
                        }}
                        className={`h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary ${errors.password ? "border-red-500" : ""}`}
                        required
                        autoComplete="current-password"
                        enterKeyHint="done"
                      />
                    </div>
                    <FormError message={errors.password} />
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs uppercase">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="rounded border-white/20 bg-white/5 text-primary" />
                      <span className="text-white/60">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-primary transition-transform hover:translate-x-2"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full border-primary bg-primary text-secondary hover:bg-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Please wait..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 border-t-2 border-primary/50 pt-6 text-center">
                  <p className="text-sm text-white/50">
                    Need credentials? Contact BAH Oil LLC to request investor access.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="kinetic-label mt-8 text-center text-xs text-primary/70">
          © {new Date().getFullYear()} BAH Oil LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
