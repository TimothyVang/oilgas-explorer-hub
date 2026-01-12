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
    <div className="min-h-screen bg-midnight flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background - matches homepage Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />
      
      {/* Single centered glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Bold background typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[15vw] font-black tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent opacity-[0.03]">
          RESET
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
              Reset Password
            </h1>
            <p className="text-white/60 text-sm">
              {isSubmitted 
                ? "Check your email for a reset link" 
                : "Enter your email to receive a password reset link"}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg"
                    required
                    autoComplete="email"
                    enterKeyHint="send"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-white text-midnight font-semibold hover:bg-white/90 transition-all rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <p className="text-white/60 text-sm">
                We've sent a password reset link to <strong className="text-white">{email}</strong>. 
                Click the link in the email to reset your password.
              </p>
              <Button 
                variant="outline" 
                className="w-full h-11 border-white/10 text-white hover:bg-white/10 rounded-lg"
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
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Remember your password?{" "}
              <Link to="/login" className="text-white hover:text-white/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Company Name */}
        <p className="text-center text-white/30 mt-8 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;