import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, LogOut, Mail, Menu, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import bahLogo from "@/assets/bah-logo-rounded.png";
import { siteConfig } from "@/constants/siteConfig";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isHomePage = location.pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (!isHomePage) {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
      setIsMobileMenuOpen(false);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50 px-3 py-3 md:px-6"
    >
      <div className={`mx-auto flex h-16 max-w-7xl items-center justify-between transition-all duration-300 ${isScrolled ? "rounded-full border-2 border-secondary bg-[#F8F6F0]/95 px-3 shadow-[6px_6px_0_#C09B4C]" : "px-0"}`}>
        <div className="z-50 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105" aria-label="BAH Oil LLC home">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-secondary bg-white">
              <img src={bahLogo} alt="BAH Oil LLC" className="h-full w-full object-cover" />
            </div>
            <span className="hidden font-mono text-xs font-bold uppercase tracking-[-0.02em] text-secondary lg:block">
              BAH OIL LLC
            </span>
          </Link>
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border-2 border-secondary bg-secondary p-1 lg:flex">
          <NavLink onClick={() => scrollToSection("home")}>Home</NavLink>
          <Link to="/about" className="rounded-full px-4 py-2 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-white transition-colors hover:bg-white hover:text-secondary">
            About
          </Link>
          <NavLink onClick={() => scrollToSection("services")}>Approach</NavLink>
          <NavLink onClick={() => scrollToSection("governance")}>Governance</NavLink>
          <NavLink onClick={() => scrollToSection("contact")}>Contact</NavLink>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={`mailto:${siteConfig.contact.email}`} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary transition-all hover:scale-105 hover:bg-secondary hover:text-primary" aria-label="Email BAH Oil">
            <Mail className="h-4 w-4" />
          </a>
          {siteConfig.social.linkedin && (
            <a href={siteConfig.social.linkedin} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary transition-all hover:scale-105 hover:bg-secondary hover:text-primary" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button size="sm" className="h-11 rounded-full border-secondary bg-secondary px-4 text-white hover:scale-105 hover:bg-[#08263F] hover:text-white">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button size="sm" onClick={handleSignOut} className="h-11 rounded-full border-secondary bg-white px-4 text-secondary hover:scale-105 hover:bg-secondary hover:text-primary">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" className="h-11 rounded-full border-secondary bg-secondary px-5 text-white hover:scale-105 hover:bg-[#08263F]">
                  Investor Login
                </Button>
              </Link>
              <Button onClick={() => scrollToSection("contact")} className="h-11 rounded-full border-secondary bg-white px-6 text-secondary hover:scale-105 hover:bg-secondary hover:text-primary">
                  Contact BAH
              </Button>
            </>
          )}
        </div>

        <div className="z-50 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className="rounded-full border-2 border-secondary bg-secondary text-white hover:bg-white hover:text-secondary"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            style={{ transformOrigin: "top" }}
            className="fixed inset-0 z-40 overflow-hidden bg-primary lg:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-6 p-4 text-secondary">
              <MobileNavLink onClick={() => scrollToSection("home")}>Home</MobileNavLink>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="kinetic-heading min-h-[44px] min-w-[44px] px-4 py-2 text-5xl transition-transform hover:translate-x-4">
                About
              </Link>
              <MobileNavLink onClick={() => scrollToSection("services")}>Approach</MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("governance")}>Governance</MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("contact")}>Contact</MobileNavLink>

              <div className="my-2 h-0.5 w-24 bg-secondary" />

              {user ? (
                <div className="flex w-full max-w-xs flex-col gap-4">
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="min-h-[44px] w-full rounded-full border-secondary bg-secondary text-white">Dashboard</Button>
                  </Link>
                  <Button onClick={handleSignOut} className="min-h-[44px] gap-2 rounded-full border-secondary bg-white text-secondary">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex w-full max-w-xs flex-col gap-4">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button className="min-h-[44px] w-full rounded-full border-secondary bg-secondary text-white">Investor Login</Button>
                  </Link>
                  <Button onClick={() => scrollToSection("contact")} className="min-h-[44px] w-full rounded-full border-secondary bg-white text-secondary">
                    Contact BAH
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavLink = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="rounded-full px-4 py-2 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-white transition-colors hover:bg-white hover:text-secondary"
  >
    {children}
  </button>
);

const MobileNavLink = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="kinetic-heading min-h-[44px] min-w-[44px] px-4 py-2 text-5xl transition-transform hover:translate-x-4">
    {children}
  </button>
);

export default Navigation;
