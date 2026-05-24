import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building, Camera, Loader2, Mail, Phone, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError, useFormErrors } from "@/components/ui/form-error";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { ProfileSkeleton } from "@/components/loading/PageLoadingSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { profileSchema, validateForm } from "@/lib/validation";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { errors, setErrors, clearError, clearAllErrors } = useFormErrors();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        return;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setCompanyName(data.company_name || "");
        setPhone(data.phone || "");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const handleSaveProfile = async () => {
    clearAllErrors();
    const formData = { fullName, companyName, phone };
    const validation = validateForm(profileSchema, formData);
    if (!validation.success && "errors" in validation) {
      setErrors(validation.errors);
      return;
    }

    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          company_name: companyName.trim() || null,
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload image");
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        toast.error("Failed to update avatar");
        return;
      }

      toast.success("Avatar updated!");
      fetchProfile();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  if (authLoading || isLoading) return <ProfileSkeleton />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,155,76,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <span className="kinetic-heading text-[18vw] text-primary opacity-[0.06]">PROFILE</span>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 pt-28 md:pt-32">
        <button onClick={() => navigate("/dashboard")} className="kinetic-label mb-8 inline-flex items-center gap-2 text-primary transition-transform hover:translate-x-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <section className="border-2 border-primary bg-[#08263F] p-6 md:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary text-secondary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="kinetic-label text-xs text-primary">Investor identity</p>
              <h1 className="kinetic-heading text-5xl text-white">Account Settings</h1>
            </div>
          </div>

          <div className="mb-8 flex items-center gap-6 border-b-2 border-primary/60 pb-8">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-none border-2 border-primary">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                <AvatarFallback className="rounded-none bg-primary font-mono text-2xl font-bold text-secondary">{getInitials()}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-secondary text-primary transition-transform hover:scale-110 disabled:opacity-50"
                aria-label="Upload avatar"
              >
                {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <div>
              <h2 className="kinetic-heading text-3xl text-white">{fullName || "Your Name"}</h2>
              <p className="font-mono text-xs uppercase text-primary">{user?.email}</p>
              <p className="mt-2 text-sm text-white/50">Click the camera icon to update your photo.</p>
            </div>
          </div>

          <div className="space-y-6">
            <ProfileField id="fullName" label="Full Name" icon={User} error={errors.fullName}>
              <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }} className={`h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary ${errors.fullName ? "border-red-500" : ""}`} autoComplete="name" />
            </ProfileField>

            <ProfileField id="email" label="Email Address" icon={Mail} helper="Email cannot be changed">
              <Input id="email" type="email" value={user?.email || ""} disabled className="h-11 rounded-none border-2 border-primary/30 bg-secondary pl-10 text-white/50" />
            </ProfileField>

            <ProfileField id="companyName" label="Company Name" icon={Building} error={errors.companyName}>
              <Input id="companyName" type="text" placeholder="Your Company" value={companyName} onChange={(e) => { setCompanyName(e.target.value); clearError("companyName"); }} className={`h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary ${errors.companyName ? "border-red-500" : ""}`} autoComplete="organization" />
            </ProfileField>

            <ProfileField id="phone" label="Phone Number" icon={Phone} error={errors.phone}>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => { setPhone(e.target.value); clearError("phone"); }} className={`h-11 rounded-none border-2 border-primary/60 bg-secondary pl-10 text-white placeholder:text-white/30 focus:border-primary ${errors.phone ? "border-red-500" : ""}`} autoComplete="tel" />
            </ProfileField>

            <Button onClick={handleSaveProfile} className="h-11 w-full border-primary bg-primary text-secondary hover:bg-white" disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </div>
        </section>

        <section className="mt-6 border-2 border-primary bg-[#08263F] p-6 md:p-8">
          <h2 className="kinetic-heading mb-6 text-4xl text-white">Security</h2>
          <TwoFactorSetup />
        </section>

        <section className="mt-6 border-2 border-primary bg-[#08263F] p-6 md:p-8">
          <h2 className="kinetic-heading mb-6 text-4xl text-white">Notifications</h2>
          <NotificationPreferences />
        </section>

        <p className="kinetic-label mt-8 text-center text-xs text-primary/70">
          &copy; {new Date().getFullYear()} BAH Oil LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

const ProfileField = ({ id, label, icon: Icon, children, error, helper }: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; error?: string; helper?: string }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="kinetic-label text-xs text-primary">{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
      {children}
    </div>
    {helper && <p className="font-mono text-xs text-white/40">{helper}</p>}
    <FormError message={error} />
  </div>
);

export default Profile;
