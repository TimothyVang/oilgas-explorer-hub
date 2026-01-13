import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { useMFA } from "@/hooks/useMFA";
import { toast } from "sonner";

interface TwoFactorVerifyProps {
  onSuccess: () => void;
  onBack?: () => void;
  className?: string;
}

export function TwoFactorVerify({ onSuccess, onBack, className }: TwoFactorVerifyProps) {
  const { factors, verifyTOTP, error, clearError } = useMFA();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const verifiedFactor = factors.find(f => f.status === "verified");

  const handleVerify = async () => {
    if (!verifiedFactor || code.length !== 6) return;

    setIsVerifying(true);
    setLocalError(null);
    clearError();

    const success = await verifyTOTP(verifiedFactor.id, code);

    if (success) {
      toast.success("Verification successful!");
      onSuccess();
    } else {
      setLocalError("Invalid code. Please try again.");
      setCode("");
    }

    setIsVerifying(false);
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setLocalError(null);
    clearError();

    // Auto-submit when 6 digits entered
    if (value.length === 6 && verifiedFactor) {
      setIsVerifying(true);
      verifyTOTP(verifiedFactor.id, value).then((success) => {
        if (success) {
          toast.success("Verification successful!");
          onSuccess();
        } else {
          setLocalError("Invalid code. Please try again.");
          setCode("");
        }
        setIsVerifying(false);
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto bg-primary/20 rounded-xl flex items-center justify-center mb-4">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
        <p className="text-white/60 text-sm">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={handleCodeChange}
          disabled={isVerifying}
          className="gap-2"
        >
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="w-12 h-14 text-xl bg-white/5 border-white/20 text-white"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Error Message */}
      {(localError || error) && (
        <p className="text-red-400 text-sm text-center">{localError || error}</p>
      )}

      {/* Verify Button */}
      <Button
        className="w-full h-11 bg-white text-midnight font-semibold hover:bg-white/90"
        onClick={handleVerify}
        disabled={code.length !== 6 || isVerifying}
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>

      {/* Backup Code Option */}
      <div className="text-center">
        <button
          type="button"
          className="text-white/50 text-sm hover:text-white transition-colors"
          onClick={() => {
            // TODO: Implement backup code flow
            toast.info("Backup code verification coming soon");
          }}
        >
          Use a backup code instead
        </button>
      </div>

      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          className="w-full text-white/60 hover:text-white hover:bg-white/5"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Button>
      )}
    </div>
  );
}

export default TwoFactorVerify;
