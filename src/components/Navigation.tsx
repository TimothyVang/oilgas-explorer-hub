import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { Breadcrumb } from "@/components/Breadcrumb";

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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (!isHomePage) {
      // Navigate to home page then scroll after navigation
      navigate('/');
      // Wait for navigation to complete then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      setIsMobileMenuOpen(false);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${isScrolled
          ? "bg-midnight/80 backdrop-blur-lg shadow-lg border-white/5 py-2"
          : "bg-transparent py-4"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 z-50">
            <Link to="/" className="text-2xl font-bold tracking-tighter flex-shrink-0">
              <span className="text-white">BAH</span>
              <span className="text-primary">.Energy</span>
            </Link>
            {/* Inline Breadcrumb */}
            {!isHomePage && (
              <>
                <div className="hidden sm:block h-5 w-px bg-white/20" />
                <div className="hidden sm:block">
                  <Breadcrumb />
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink isScrolled={isScrolled} onClick={() => scrollToSection("home")}>Home</NavLink>
            <Link to="/about" className={`text-sm font-medium transition-colors hover:text-primary ${isScrolled ? 'text-gray-300' : 'text-white/90'}`}>
              About
            </Link>
            <NavLink isScrolled={isScrolled} onClick={() => scrollToSection("services")}>Services</NavLink>
            <NavLink isScrolled={isScrolled} onClick={() => scrollToSection("contact")}>Contact</NavLink>

            {/* Search Button */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  ctrlKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all hover:bg-white/10 ${
                isScrolled
                  ? "text-gray-400 border-white/10 hover:text-white"
                  : "text-white/70 border-white/20 hover:text-white"
              }`}
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] opacity-60">
                <span>2318</span>K
              </kbd>
            </button>

            {/* Divider */}
            <div className={`h-6 w-px ${isScrolled ? 'bg-white/10' : 'bg-white/20'}`} />

            {/* User Actions */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-primary hover:text-primary transition-all duration-300"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`border border-transparent hover:border-white/20 hover:bg-white/5 ${isScrolled ? 'text-white' : 'text-white'}`}
                  >
                    Investor Portal
                  </Button>
                </Link>
                <Button 
                  onClick={() => scrollToSection("contact")}
                  className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] rounded-full px-6 transition-all duration-300"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            style={{ transformOrigin: 'top' }}
            className="md:hidden fixed inset-0 bg-midnight/95 backdrop-blur-xl z-40 overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8 p-4">
              <MobileNavLink onClick={() => scrollToSection("home")}>Home</MobileNavLink>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white/80 hover:text-primary transition-colors min-h-[44px] min-w-[44px] px-4 py-2">
                About
              </Link>
              <MobileNavLink onClick={() => scrollToSection("services")}>Services</MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("contact")}>Contact</MobileNavLink>

              <div className="w-16 h-px bg-white/10 my-4" />

              {user ? (
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20 bg-white/5 text-white min-h-[44px]">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleSignOut} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2 min-h-[44px]">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full border-white/20 bg-white/5 text-white min-h-[44px]">
                      Investor Portal
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => scrollToSection("contact")}
                    className="w-full bg-primary hover:bg-primary/90 text-white min-h-[44px]"
                  >
                    Get Started
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

// Helper Components
const NavLink = ({ children, onClick, isScrolled }: { children: React.ReactNode, onClick: () => void, isScrolled: boolean }) => (
  <button
    onClick={onClick}
    className={`text-sm font-medium transition-colors hover:text-primary ${isScrolled ? 'text-gray-300' : 'text-white/90'}`}
  >
    {children}
  </button>
);

const MobileNavLink = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="text-2xl font-bold text-white/80 hover:text-primary transition-colors min-h-[44px] min-w-[44px] px-4 py-2"
  >
    {children}
  </button>
);

export default Navigation;
