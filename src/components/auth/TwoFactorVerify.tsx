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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-primary bg-primary text-secondary">
          <Shield className="h-7 w-7" />
        </div>
        <h2 className="kinetic-heading text-4xl text-white">Two-Factor Authentication</h2>
        <p className="kinetic-label text-xs text-primary">
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
                className="h-14 w-12 border-2 border-primary bg-secondary text-xl text-white"
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
        className="h-11 w-full border-primary bg-primary text-secondary hover:bg-white"
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

      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          className="w-full text-primary hover:bg-primary hover:text-secondary"
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
