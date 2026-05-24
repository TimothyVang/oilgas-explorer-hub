import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserMessage } from "@/lib/errorMessages";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(getUserMessage(error));
      } else {
        setIsSubmitted(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,155,76,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.16)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="kinetic-heading text-[20vw] text-primary opacity-[0.08]">
          RESET
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
              Reset Password
            </h1>
            <p className="kinetic-label text-xs text-primary">
              {isSubmitted 
                ? "Check your email for a reset link" 
                : "Enter your email to receive a password reset link"}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="kinetic-label text-xs text-primary">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary"
                    required
                    autoComplete="email"
                    enterKeyHint="send"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full rounded-full border-primary bg-primary text-secondary hover:bg-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-primary bg-primary text-secondary">
                <Mail className="h-7 w-7" />
              </div>
              <p className="text-white/60 text-sm">
                We've sent a password reset link to <strong className="text-white">{email}</strong>. 
                Click the link in the email to reset your password.
              </p>
              <Button 
                variant="outline" 
                className="h-12 w-full rounded-full border-primary text-primary hover:bg-primary hover:text-secondary"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Try a different email
              </Button>
            </div>
          )}

          {/* Back to sign in */}
          <div className="mt-6 border-t-2 border-primary/50 pt-6 text-center">
            <p className="text-white/50 text-sm">
              Remember your password?{" "}
              <Link to="/login" className="font-bold text-primary transition-transform hover:translate-x-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Company Name */}
        <p className="kinetic-label mt-8 text-center text-xs text-primary/70">
          © {new Date().getFullYear()} BAH Oil LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
