import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Info,
  FileText,
  User,
  Shield,
  Settings,
  Mail,
  LogIn,
  LogOut,
  HelpCircle,
  Briefcase,
  Users,
  TrendingUp,
} from "lucide-react";

interface SearchItem {
  id: string;
  name: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  requiresGuest?: boolean;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isAdmin = user?.user_metadata?.role === "admin";

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  // Scroll to section on home page
  const scrollToSection = useCallback((sectionId: string) => {
    navigate("/");
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [navigate]);

  // Define all searchable items
  const pageItems: SearchItem[] = [
    {
      id: "home",
      name: "Home",
      description: "Go to the home page",
      icon: Home,
      action: () => navigate("/"),
      keywords: ["main", "landing", "start"],
    },
    {
      id: "about",
      name: "About Us",
      description: "Learn about BAH Energy",
      icon: Info,
      action: () => navigate("/about"),
      keywords: ["company", "team", "history", "mission"],
    },
    {
      id: "login",
      name: "Investor Portal Login",
      description: "Sign in to access investor documents",
      icon: LogIn,
      action: () => navigate("/login"),
      keywords: ["sign in", "authentication", "access"],
      requiresGuest: true,
    },
    {
      id: "dashboard",
      name: "Dashboard",
      description: "View your investor dashboard",
      icon: TrendingUp,
      action: () => navigate("/dashboard"),
      keywords: ["overview", "summary", "home"],
      requiresAuth: true,
    },
    {
      id: "documents",
      name: "Investor Documents",
      description: "Access confidential investment documents",
      icon: FileText,
      action: () => navigate("/investor-documents"),
      keywords: ["files", "nda", "investment", "pdf"],
      requiresAuth: true,
    },
    {
      id: "profile",
      name: "Profile Settings",
      description: "Manage your account settings",
      icon: User,
      action: () => navigate("/profile"),
      keywords: ["account", "settings", "preferences", "avatar"],
      requiresAuth: true,
    },
    {
      id: "admin",
      name: "Admin Dashboard",
      description: "Manage users and system settings",
      icon: Shield,
      action: () => navigate("/admin"),
      keywords: ["management", "users", "system", "administration"],
      requiresAdmin: true,
    },
  ];

  const sectionItems: SearchItem[] = [
    {
      id: "services",
      name: "Our Services",
      description: "Exploration and infrastructure services",
      icon: Briefcase,
      action: () => scrollToSection("services"),
      keywords: ["offerings", "solutions", "capabilities"],
    },
    {
      id: "team",
      name: "Our Team",
      description: "Meet the leadership team",
      icon: Users,
      action: () => scrollToSection("team"),
      keywords: ["people", "staff", "executives", "leadership"],
    },
    {
      id: "contact",
      name: "Contact Us",
      description: "Get in touch with our team",
      icon: Mail,
      action: () => scrollToSection("contact"),
      keywords: ["email", "phone", "support", "help"],
    },
    {
      id: "portfolio",
      name: "Portfolio",
      description: "View our project portfolio",
      icon: TrendingUp,
      action: () => scrollToSection("portfolio"),
      keywords: ["projects", "work", "case studies"],
    },
  ];

  const actionItems: SearchItem[] = [
    {
      id: "signout",
      name: "Sign Out",
      description: "Log out of your account",
      icon: LogOut,
      action: handleSignOut,
      keywords: ["logout", "exit", "leave"],
      requiresAuth: true,
    },
    {
      id: "help",
      name: "Help & Support",
      description: "Contact support for assistance",
      icon: HelpCircle,
      action: () => scrollToSection("contact"),
      keywords: ["faq", "question", "assistance"],
    },
  ];

  // Filter items based on auth state
  const filterItems = (items: SearchItem[]) => {
    return items.filter((item) => {
      if (item.requiresAuth && !user) return false;
      if (item.requiresAdmin && !isAdmin) return false;
      if (item.requiresGuest && user) return false;
      return true;
    });
  };

  const filteredPages = filterItems(pageItems);
  const filteredSections = filterItems(sectionItems);
  const filteredActions = filterItems(actionItems);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {filteredPages.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.name} ${item.description} ${item.keywords?.join(" ") || ""}`}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{item.name}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Sections">
          {filteredSections.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.name} ${item.description} ${item.keywords?.join(" ") || ""}`}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{item.name}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {filteredActions.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.name} ${item.description} ${item.keywords?.join(" ") || ""}`}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{item.name}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Search trigger button for navigation
export function SearchTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // This component doesn't control the dialog, just shows the hint
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <button
      onClick={() => {
        // Trigger the keyboard shortcut programmatically
        const event = new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      }}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md border border-input bg-background hover:bg-accent ${className}`}
    >
      <span className="hidden sm:inline-flex">Search</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}

export default GlobalSearch;
