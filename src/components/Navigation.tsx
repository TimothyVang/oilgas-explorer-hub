import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (!isHomePage) {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-primary/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className={`text-2xl font-bold ${isScrolled ? "text-gradient" : "text-accent"}`}>
              BAH Oil and Gas
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              Home
            </button>
            <Link
              to="/about"
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              About
            </Link>
            <button
              onClick={() => scrollToSection("services")}
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              Contact
            </button>
            
            {/* Investor Portal / User Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={`${
                      isScrolled 
                        ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground" 
                        : "border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className={`${
                    isScrolled 
                      ? "text-muted-foreground hover:text-foreground" 
                      : "text-primary-foreground/80 hover:text-primary-foreground"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`${
                    isScrolled 
                      ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground" 
                      : "border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Investor Portal
                </Button>
              </Link>
            )}
            
            <Button variant="hero" size="lg" onClick={() => scrollToSection("contact")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={!isScrolled ? "text-primary-foreground hover:text-accent" : ""}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("home")}
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
            >
              Home
            </button>
            <Link
              to="/about"
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <button
              onClick={() => scrollToSection("services")}
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
            >
              Contact
            </button>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-accent text-accent">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-accent text-accent">
                  <User className="w-4 h-4 mr-2" />
                  Investor Portal
                </Button>
              </Link>
            )}
            <Button variant="hero" className="w-full" onClick={() => scrollToSection("contact")}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
