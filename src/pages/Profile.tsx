import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Loader2, User, Building, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { profileSchema, validateForm } from "@/lib/validation";
import { FormError, useFormErrors } from "@/components/ui/form-error";
import { getUserMessage } from "@/lib/errorMessages";
import { ProfileSkeleton } from "@/components/loading/PageLoadingSkeleton";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
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
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

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
  };

  const handleSaveProfile = async () => {
    clearAllErrors();
    const formData = { fullName, companyName, phone };
    const validation = validateForm(profileSchema, formData);
    if (!validation.success) {
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload image");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  if (authLoading || isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-midnight relative overflow-hidden">
      
      {/* Background - matches homepage Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />
      
      {/* Single centered glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Bold background typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[15vw] font-black tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent opacity-[0.03]">
          PROFILE
        </span>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-32 max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Profile Card - Clean glassmorphism */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Account Settings
              </h1>
              <p className="text-white/60 text-sm">
                Manage your profile information
              </p>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white/10">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 bg-white text-midnight p-2 rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {fullName || "Your Name"}
              </h2>
              <p className="text-white/60 text-sm">{user?.email}</p>
              <p className="text-white/40 text-xs mt-1">
                Click the camera icon to update your photo
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
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
                  onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
                  className={`pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg ${errors.fullName ? "border-red-500/50" : ""}`}
                  autoComplete="name"
                />
              </div>
              <FormError message={errors.fullName} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70 text-sm">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white/50 cursor-not-allowed rounded-lg"
                />
              </div>
              <p className="text-xs text-white/40">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-white/70 text-sm">
                Company Name
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your Company"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); clearError("companyName"); }}
                  className={`pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg ${errors.companyName ? "border-red-500/50" : ""}`}
                  autoComplete="organization"
                />
              </div>
              <FormError message={errors.companyName} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/70 text-sm">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                  className={`pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 rounded-lg ${errors.phone ? "border-red-500/50" : ""}`}
                  autoComplete="tel"
                />
              </div>
              <FormError message={errors.phone} />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="w-full h-11 bg-white text-midnight font-semibold hover:bg-white/90 transition-all rounded-lg"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mt-6">
          <h2 className="text-xl font-bold text-white mb-6">Security</h2>
          <TwoFactorSetup />
        </div>

        {/* Notifications Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mt-6">
          <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>
          <NotificationPreferences />
        </div>

        {/* Company Name */}
        <p className="text-center text-white/30 mt-8 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Profile;
