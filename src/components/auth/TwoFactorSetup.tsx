import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check, AlertTriangle, Download } from "lucide-react";
import { useMFA } from "@/hooks/useMFA";
import { toast } from "sonner";
import QRCode from "qrcode";

interface TwoFactorSetupProps {
  className?: string;
}

export function TwoFactorSetup({ className }: TwoFactorSetupProps) {
  const {
    factors,
    isLoading,
    error,
    enrollTOTP,
    verifyTOTP,
    unenrollTOTP,
    generateBackupCodes,
    hasMFAEnabled,
    getVerifiedFactor,
    clearError,
    fetchMFAStatus,
  } = useMFA();

  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<"qr" | "verify" | "backup" | "complete">("qr");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  const mfaEnabled = hasMFAEnabled();
  const verifiedFactor = getVerifiedFactor();

  // Reset state when dialog closes
  const resetEnrollState = () => {
    setSetupStep("qr");
    setQrCodeUrl(null);
    setSecret(null);
    setFactorId(null);
    setVerificationCode("");
    setBackupCodes([]);
    setCopiedSecret(false);
    setCopiedBackupCodes(false);
    clearError();
  };

  const resetDisableState = () => {
    setDisableCode("");
    clearError();
  };

  // Start enrollment process
  const handleStartEnroll = async () => {
    const result = await enrollTOTP("Authenticator App");

    if (result) {
      setFactorId(result.id);
      setSecret(result.totp.secret);

      // Generate QR code image
      try {
        const qrDataUrl = await QRCode.toDataURL(result.totp.uri, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        setQrCodeUrl(qrDataUrl);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        toast.error("Failed to generate QR code");
      }
    }
  };

  // Verify the TOTP code
  const handleVerify = async () => {
    if (!factorId || verificationCode.length !== 6) return;

    setIsVerifying(true);
    const success = await verifyTOTP(factorId, verificationCode);
    setIsVerifying(false);

    if (success) {
      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      setSetupStep("backup");
      toast.success("Two-factor authentication verified!");
    } else {
      toast.error("Invalid verification code. Please try again.");
      setVerificationCode("");
    }
  };

  // Complete setup
  const handleComplete = () => {
    setSetupStep("complete");
    setTimeout(() => {
      setIsEnrollDialogOpen(false);
      resetEnrollState();
      fetchMFAStatus();
    }, 2000);
  };

  // Disable 2FA
  const handleDisable = async () => {
    if (!verifiedFactor || disableCode.length !== 6) return;

    setIsDisabling(true);
    const success = await verifyTOTP(verifiedFactor.id, disableCode);

    if (success) {
      const unenrollSuccess = await unenrollTOTP(verifiedFactor.id);
      if (unenrollSuccess) {
        toast.success("Two-factor authentication disabled");
        setIsDisableDialogOpen(false);
        resetDisableState();
      } else {
        toast.error("Failed to disable 2FA");
      }
    } else {
      toast.error("Invalid verification code");
      setDisableCode("");
    }
    setIsDisabling(false);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, type: "secret" | "backup") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackupCodes(true);
      setTimeout(() => setCopiedBackupCodes(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const content = `BAH Energy - Two-Factor Authentication Backup Codes
Generated: ${new Date().toISOString()}

Store these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}

If you lose access to your authenticator app, you can use one of these codes to sign in.
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bah-energy-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  // Initialize enrollment when dialog opens
  useEffect(() => {
    if (isEnrollDialogOpen && setupStep === "qr" && !qrCodeUrl) {
      handleStartEnroll();
    }
  }, [isEnrollDialogOpen, setupStep, qrCodeUrl]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-white/60" />
        <span className="text-white/60 text-sm">Loading security settings...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          {mfaEnabled ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          ) : (
            <Shield className="w-6 h-6 text-white/60" />
          )}
          <div>
            <h3 className="text-white font-medium">Two-Factor Authentication</h3>
            <p className="text-white/60 text-sm">
              {mfaEnabled
                ? "Your account is protected with 2FA"
                : "Add an extra layer of security to your account"}
            </p>
          </div>
        </div>

        {mfaEnabled ? (
          <Dialog open={isDisableDialogOpen} onOpenChange={(open) => {
            setIsDisableDialogOpen(open);
            if (!open) resetDisableState();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                <ShieldOff className="w-4 h-4 mr-2" />
                Disable
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-midnight border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Disable Two-Factor Authentication
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  Enter your 6-digit code from your authenticator app to confirm.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={disableCode}
                    onChange={setDisableCode}
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

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setIsDisableDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDisable}
                    disabled={disableCode.length !== 6 || isDisabling}
                  >
                    {isDisabling ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Disable 2FA
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isEnrollDialogOpen} onOpenChange={(open) => {
            setIsEnrollDialogOpen(open);
            if (!open) resetEnrollState();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Shield className="w-4 h-4 mr-2" />
                Enable
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-midnight border-white/10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Set Up Two-Factor Authentication
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  {setupStep === "qr" && "Scan the QR code with your authenticator app"}
                  {setupStep === "verify" && "Enter the 6-digit code from your app"}
                  {setupStep === "backup" && "Save your backup codes"}
                  {setupStep === "complete" && "You're all set!"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Step 1: QR Code */}
                {setupStep === "qr" && (
                  <>
                    {qrCodeUrl ? (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="p-4 bg-white rounded-lg">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-white/60 text-sm text-center">
                            Can't scan? Enter this key manually:
                          </p>
                          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                            <code className="flex-1 text-sm text-white font-mono break-all">
                              {secret}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(secret || "", "secret")}
                              className="shrink-0"
                            >
                              {copiedSecret ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => setSetupStep("verify")}
                        >
                          Continue
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                  </>
                )}

                {/* Step 2: Verify */}
                {setupStep === "verify" && (
                  <div className="space-y-6">
                    <p className="text-white/70 text-sm text-center">
                      Enter the 6-digit code shown in your authenticator app
                    </p>

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
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

                    {error && (
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                        onClick={() => setSetupStep("qr")}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleVerify}
                        disabled={verificationCode.length !== 6 || isVerifying}
                      >
                        {isVerifying ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Verify
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Backup Codes */}
                {setupStep === "backup" && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-amber-200 font-medium mb-1">
                            Save these backup codes
                          </p>
                          <p className="text-amber-200/70">
                            Store them securely. You'll need one if you lose access to your authenticator app.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
                      {backupCodes.map((code, index) => (
                        <code key={index} className="text-white/90 font-mono text-sm py-1">
                          {code}
                        </code>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                        onClick={() => copyToClipboard(backupCodes.join("\n"), "backup")}
                      >
                        {copiedBackupCodes ? (
                          <Check className="w-4 h-4 mr-2 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                        onClick={downloadBackupCodes}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <Button className="w-full" onClick={handleComplete}>
                      I've Saved My Codes
                    </Button>
                  </div>
                )}

                {/* Step 4: Complete */}
                {setupStep === "complete" && (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">2FA Enabled!</h3>
                      <p className="text-white/60 text-sm mt-1">
                        Your account is now protected with two-factor authentication.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {mfaEnabled && verifiedFactor && (
        <div className="text-white/40 text-xs px-4">
          Enabled on {new Date(verifiedFactor.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default TwoFactorSetup;
